"""Verify and publish a pre-signed APK; no private key enters this repository."""
import base64
import gzip
import hashlib
import json
import os
import re
import subprocess
import tempfile
import time
from pathlib import Path

REPO = 'chatailari/doom-zomboid-downloads'

def gh(*args, check=True):
    # Release edits and clobber uploads are idempotent; release creation is not.
    retryable = args[:2] in [('release', 'view'), ('release', 'edit'),
                            ('release', 'download')] or (
        args[:2] == ('release', 'upload') and '--clobber' in args)
    for attempt in range(3):
        result = subprocess.run(['gh', *args], capture_output=True, text=True)
        if not result.returncode:
            return result
        transient = re.search(r'HTTP (429|500|502|503|504)\b', result.stderr)
        if not retryable or not transient or attempt == 2:
            if check:
                raise RuntimeError('GitHub release operation failed: ' + result.stderr.strip())
            return result
        print('Retrying transient GitHub error for ' + ' '.join(args[:2]), flush=True)
        time.sleep(2 ** attempt)

def checkpoint(stage, tag, manifest):
    state = {'stage': stage, 'tag': tag, 'version_code': manifest['version_code'],
             'apk_sha256': manifest['sha256'], 'apk_url': manifest['url']}
    path = Path('publication-checkpoint.json')
    temporary = path.with_suffix('.tmp')
    temporary.write_text(json.dumps(state, indent=2) + '\n')
    temporary.replace(path)
    print('Publication checkpoint: ' + stage, flush=True)

def digest(path):
    h = hashlib.sha256()
    with path.open('rb') as source:
        for block in iter(lambda: source.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()

def release(tag, title, notes):
    result = gh('release', 'view', tag, '--repo', REPO, '--json', 'isDraft', check=False)
    if result.returncode:
        gh('release', 'create', tag, '--repo', REPO, '--target', 'main',
           '--draft', '--prerelease', '--title', title, '--notes', notes)

def verify_delta_asset(spec, manifest, root, tag, name):
    """Validate optional delta against the already RSA-verified manifest."""
    extra_assets = []
    if 'delta' in manifest:
        signed_delta = manifest['delta']
        delta = spec.get('delta')
        if not isinstance(delta, dict) or not isinstance(signed_delta, dict):
            raise ValueError('Signed delta metadata or transport missing')
        patch_name = name + '.dzp'
        patch_url = f'https://github.com/{REPO}/releases/download/{tag}/{patch_name}'
        if signed_delta.get('url') != patch_url or delta.get('name') != patch_name:
            raise ValueError('Delta URL or identity mismatch')
        if signed_delta.get('sha256') != delta.get('sha256') or signed_delta.get('size') != delta.get('size'):
            raise ValueError('Signed delta hash/size mismatch')
        if not 1024 <= int(signed_delta['size']) < int(manifest['size']):
            raise ValueError('Delta not smaller than APK')
        if int(signed_delta['from_version_code']) >= int(manifest['version_code']):
            raise ValueError('Delta base must be older')
        patch = root / patch_name
        with patch.open('wb') as output:
            for i, chunk in enumerate(delta['parts']):
                path = Path(f'delta_parts/{i:03d}.deltapart')
                if chunk['path'] != str(path) or digest(path) != chunk['sha256']:
                    raise ValueError('Missing or corrupt delta transport')
                output.write(path.read_bytes())
        if patch.stat().st_size != int(signed_delta['size']) or digest(patch) != signed_delta['sha256']:
            raise ValueError('Delta payload verification failed')
        extra_assets.append(str(patch))
    return extra_assets

def main():
    spec = json.loads(Path('publish.json').read_text())
    tag, name = spec['tag'], spec['apk_name']
    if not re.fullmatch(r'v0\.2\.0-dev\.\d+', tag):
        raise ValueError('Development release tag required')
    if not re.fullmatch(r'DOOM-ZOMBOID-[A-Za-z0-9.\-]+\.apk', name):
        raise ValueError('Unexpected APK basename')
    envelope = json.loads(Path('candidate.json').read_text())
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        payload = root / 'payload.json'
        signature = root / 'signature.bin'
        payload.write_bytes(envelope['payload'].encode())
        signature.write_bytes(base64.b64decode(envelope['signature'], validate=True))
        subprocess.run(['openssl', 'dgst', '-sha256', '-verify', 'update_public.pem',
                        '-signature', str(signature), str(payload)], check=True)
        manifest = json.loads(payload.read_text())
        expected_url = f'https://github.com/{REPO}/releases/download/{tag}/{name}'
        if manifest['package'] != 'cl.nazaret.doomzomboid' or manifest['url'] != expected_url:
            raise ValueError('Manifest identity or release URL mismatch')
        if int(manifest['version_code']) != int(spec['version_code']):
            raise ValueError('Version mismatch')
        archive = root / 'apk.gz'
        with archive.open('wb') as output:
            for index, part in enumerate(spec['parts']):
                path = Path(f'parts/{index:03d}.gzpart')
                if part['path'] != str(path) or digest(path) != part['sha256']:
                    raise ValueError('Missing or corrupt transport part')
                output.write(path.read_bytes())
        if digest(archive) != spec['gzip_sha256']:
            raise ValueError('Transport archive checksum mismatch')
        apk = root / name
        with gzip.open(archive, 'rb') as source, apk.open('wb') as target:
            for block in iter(lambda: source.read(1024 * 1024), b''):
                target.write(block)
        if apk.stat().st_size != int(manifest['size']) or digest(apk) != manifest['sha256']:
            raise ValueError('APK size or SHA-256 mismatch')
        checkpoint('verified_apk', tag, manifest)
        checksum = root / (name + '.sha256')
        checksum.write_text(manifest['sha256'] + '  ' + name + '\n')
        extra_assets = verify_delta_asset(spec, manifest, root, tag, name)
        channel = root / 'channel.json'
        channel.write_text(json.dumps(envelope, indent=2) + '\n')
        existing = gh('release', 'view', 'android-channel', '--repo', REPO,
                      '--json', 'assets', check=False)
        if existing.returncode == 0 and any(x['name'] == 'channel.json'
                for x in json.loads(existing.stdout)['assets']):
            previous = root / 'previous.json'
            gh('release', 'download', 'android-channel', '--repo', REPO,
               '--pattern', 'channel.json', '--output', str(previous))
            old_envelope = json.loads(previous.read_text())
            payload.write_bytes(old_envelope['payload'].encode())
            signature.write_bytes(base64.b64decode(old_envelope['signature'], validate=True))
            subprocess.run(['openssl', 'dgst', '-sha256', '-verify', 'update_public.pem',
                            '-signature', str(signature), str(payload)], check=True)
            old = json.loads(old_envelope['payload'])
            if int(manifest['version_code']) < int(old['version_code']):
                raise ValueError('Channel version cannot move backwards')
            if int(manifest['version_code']) == int(old['version_code']) and \
                    manifest['sha256'] != old['sha256']:
                raise ValueError('Cannot replace a released version with different APK bytes')
        release(tag, 'DOOM-ZOMBOID ' + manifest['version_name'],
                'Versión de desarrollo Android firmada. No certificada en teléfono físico. '
                'Instalar sobre la versión anterior, sin borrar datos. '
                'SHA-256 y firma del manifiesto verificados antes de publicar.')
        gh('release', 'upload', tag, str(apk), str(checksum), *extra_assets, '--repo', REPO, '--clobber')
        checkpoint('apk_uploaded', tag, manifest)
        gh('release', 'edit', tag, '--repo', REPO, '--draft=false', '--prerelease')
        checkpoint('apk_published', tag, manifest)
        # Update this small stable endpoint only after the APK is available.
        release('android-channel', 'Canal Android firmado',
                'Manifiesto RSA del canal de desarrollo. La aplicación verifica su autenticidad.')
        gh('release', 'upload', 'android-channel', str(channel), '--repo', REPO, '--clobber')
        checkpoint('channel_uploaded', tag, manifest)
        gh('release', 'edit', 'android-channel', '--repo', REPO, '--draft=false', '--prerelease')
        checkpoint('channel_published', tag, manifest)
        print(json.dumps({'tag': tag, 'apk': expected_url, 'sha256': manifest['sha256'],
                          'version_code': manifest['version_code'], 'published': True}))

if __name__ == '__main__':
    main()

