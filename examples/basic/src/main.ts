import { ZeroAuth } from '@sdk/index';
import QRCode from 'qrcode';

const verifier = new ZeroAuth({
    relayUrl: 'http://localhost:3000'
});

const verifyBtn = document.getElementById('verify-btn');
const qrView = document.getElementById('qr-view');
const setupView = document.getElementById('setup-view');
const successView = document.getElementById('success-view');
const qrCanvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
const proofLog = document.getElementById('proof-log');

verifyBtn?.addEventListener('click', async () => {
    setupView?.classList.add('hidden');
    qrView?.classList.remove('hidden');

    console.log("Starting verification...");

    const result = await verifier.verify({
        required_claims: ['birth_year'],
        verifier_name: 'Zero Demo App',
        credential_type: 'Age Verification'
    }, (qrData: string) => {
        console.log("QR Data Received:", qrData);
        QRCode.toCanvas(qrCanvas, qrData, { width: 256, margin: 1 }, (error) => {
            if (error) console.error("QR Render Error:", error);
        });
    });

    if (result.success) {
        qrView?.classList.add('hidden');
        successView?.classList.remove('hidden');
        if (proofLog) {
            proofLog.textContent = JSON.stringify(result.proof, null, 2);
        }
    } else {
        alert("Verification Failed: " + result.error);
        location.reload();
    }
});
