export interface VerificationResult {
    success: boolean;
    proof?: any;
    error?: string;
}

export interface VerifyOptions {
    verifier_name: string;
    required_claims: string[];
    credential_type?: string;
    timeoutMs?: number;
}

export class ZeroAuth {
    private relayUrl: string;

    constructor(options: { relayUrl: string }) {
        this.relayUrl = options.relayUrl.replace(/\/$/, '');
    }

    async verify(
        options: VerifyOptions,
        onQR?: (qrData: string) => void
    ): Promise<VerificationResult & { cancel?: () => void }> {
        try {
            const timeout = options.timeoutMs || 120000; // Default 2 minutes
            const startTime = Date.now();

            // 1. Create Session
            const response = await fetch(`${this.relayUrl}/api/v1/sessions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    verifier_name: options.verifier_name,
                    required_claims: options.required_claims,
                    credential_type: options.credential_type || 'Age Verification'
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                return { success: false, error: errData.error || 'Failed to create session' };
            }

            const { session_id, qr_payload } = await response.json();

            // 2. Notify or Display QR
            if (onQR) {
                onQR(JSON.stringify(qr_payload));
            }

            // 3. Poll for Status with Exponential Backoff
            let currentDelay = 2000;
            const backoffFactor = 1.5;
            const maxDelay = 10000;
            let networkRetries = 0;
            const maxNetworkRetries = 5;
            let cancelled = false;

            const pollPromise = new Promise<VerificationResult>((resolve) => {
                const poll = async () => {
                    if (cancelled) {
                        resolve({ success: false, error: 'Verification cancelled' });
                        return;
                    }

                    if (Date.now() - startTime > timeout) {
                        resolve({ success: false, error: 'Verification timed out' });
                        return;
                    }

                    try {
                        const statusRes = await fetch(`${this.relayUrl}/api/v1/sessions/${session_id}`);

                        if (!statusRes.ok) {
                            if (statusRes.status === 404) {
                                resolve({ success: false, error: 'Session not found or expired' });
                                return;
                            }
                            throw new Error(`Server returned ${statusRes.status}`);
                        }

                        const session = await statusRes.json();
                        networkRetries = 0; // Reset network retries on success

                        if (session.status === 'COMPLETED') {
                            resolve({ success: true, proof: session.proof });
                        } else if (session.status === 'EXPIRED') {
                            resolve({ success: false, error: 'Session expired' });
                        } else if (session.status === 'REVOKED') {
                            resolve({ success: false, error: 'Session revoked by user' });
                        } else {
                            // Still pending, continue polling
                            setTimeout(poll, currentDelay);
                            currentDelay = Math.min(currentDelay * backoffFactor, maxDelay);
                        }
                    } catch (e) {
                        networkRetries++;
                        if (networkRetries > maxNetworkRetries) {
                            resolve({ success: false, error: 'Too many network failures' });
                        } else {
                            setTimeout(poll, currentDelay);
                            currentDelay = Math.min(currentDelay * backoffFactor, maxDelay);
                        }
                    }
                };
                poll();
            });

            // Return a handle that allows cancellation
            return Object.assign(pollPromise, {
                cancel: () => { cancelled = true; }
            });

        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
}
