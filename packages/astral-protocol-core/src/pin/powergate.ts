import { Pow, createPow, ffsTypes } from '@textile/powergate-client';
import CID from 'cids';

export interface Pinning {
    open(): Promise<void>;
    close(): Promise<void>;
    pin(cid: CID): Promise<void>;
    //unpin(cid: CID): Promise<void>;
}

export enum JobStatus {
    JOB_STATUS_UNSPECIFIED = 0,
    JOB_STATUS_QUEUED = 1,
    JOB_STATUS_EXECUTING = 2,
    JOB_STATUS_FAILED = 3,
    JOB_STATUS_CANCELED = 4,
    JOB_STATUS_SUCCESS = 5,
}

// create powergate instance
export class Powergate implements Pinning {
    readonly endpoint?: string;

    // Readonly properties must be initialized at their declaration or in the constructor.
    constructor(private _host: string, private _pow: Pow, private _token?: string) {
        console.log('The Auth Token value is: ' + _token);
    }

    static async build(tokenval?: string): Promise<Powergate> {
        //const host: string = "http://0.0.0.0:6002"
        const host = 'http://40.114.81.87:6002';
        const pow: Pow = createPow({ host });
        if (tokenval) {
            pow.setToken(tokenval);
        } else {
            try {
                const { token } = await pow.ffs.create(); // save this _token for later use!
                tokenval = token;
                pow.setToken(token);
            } catch (err) {
                console.log(err);
            }
        }

        return new Powergate(host, pow, tokenval);
    }

    async createToken(): Promise<any> {
        const { token } = await this._pow.ffs.create(); // save this _token for later use!
        this._pow.setToken(token);
        return token;
    }

    get pow() {
        return this._pow;
    }

    async open(): Promise<void> {
        this._pow = createPow({ host: this._host });
        if (this._token) {
            this._pow.setToken(this._token);
        }
    }

    async getToken(): Promise<any> {
        return this._token;
    }

    async close(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    async getAssetCid(buffer: any): Promise<string> {
        const { cid } = await this._pow.ffs.stage(buffer);
        return cid;
    }

    async getGeoDIDDocument(cid: string): Promise<Uint8Array> {
        const bytes = await this.pow.ffs.get(cid);
        return bytes;
    }

    async pin(cid: any): Promise<void> {
        try {
            await this._pow.ffs.pushStorageConfig(cid.toString());
        } catch (e) {
            if (e.message.includes('cid already pinned, consider using override flag')) {
                // Do Nothing
            } else {
                throw e;
            }
        }
    }
    /*
    async unpin(cid: any): Promise<void> {
        const { config } = await this._pow.ffs.getStorageConfig(cid.toString())
        const next = Object.assign({}, config, {
            config: {
                ...config,
                repairable: false,
                hot: {
                    ...config.hot,
                    allowUnfreeze: false,
                    enabled: false
                },
                cold: {
                    ...config.cold,
                    enabled: false
                }
            }
        })
        //const opts = [ffsOptions.withOverride(true), ffsOptions.withStorageConfig(next)]
        //const {jobId} = await this._pow.ffs.pushStorageConfig(cid.toString(), ...opts)
        const {jobId} = await this._pow.ffs.pushStorageConfig(cid.toString())
        await this.waitForJobStatus(jobId, JobStatus.JOB_STATUS_SUCCESS)
        await this._pow.ffs.remove(cid.toString())
    }*/

    protected waitForJobStatus(
        jobId: string,
        status: ffsTypes.JobStatusMap[keyof ffsTypes.JobStatusMap],
    ): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const cancel = this._pow.ffs.watchJobs((job: any) => {
                if (job.errCause && job.errCause.length > 0) {
                    reject(new Error(job.errCause));
                }
                if (job.status === JobStatus.JOB_STATUS_CANCELED) {
                    reject(new Error('job canceled'));
                }
                if (job.status === JobStatus.JOB_STATUS_FAILED) {
                    reject(new Error('job failed'));
                }
                if (job.status === status) {
                    cancel();
                    resolve();
                }
            }, jobId);
        });
    }
}
