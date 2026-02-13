export interface VerificationResult {
    success: boolean;
    proof?: any;
    error?: string;
}

export interface VerifyOptions {
    claims: string[];
    verifier_name: string;
}

export class ZeroAuth {
    private relayUrl: string;

    constructor(options: { relayUrl: string }) {
        this.relayUrl = options.relayUrl.replace(/\/$/, '');
    }

    async verify(options: VerifyOptions): Promise<VerificationResult> {
        try {
            // 1. Create Session
            const response = await fetch(`${this.relayUrl}/api/v1/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options)
            });

            const { session_id, qr_payload } = await response.json();

            // 2. Display Modal (Skeleton Logic)
            console.log('Displaying QR Payload to user:', qr_payload);
            
            // 3. Poll for Status
            return new Promise((resolve) => {
                const interval = setInterval(async () => {
                    const statusRes = await fetch(`${this.relayUrl}/api/v1/sessions/${session_id}`);
                    const session = await statusRes.json();

                    if (session.status === 'COMPLETED') {
                        clearInterval(interval);
                        resolve({ success: true, proof: session.proof });
                    } else if (session.status === 'EXPIRED') {
                        clearInterval(interval);
                        resolve({ success: false, error: 'Session expired' });
                    }
                }, 3000);
            });

        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
}
