import { createPow } from '@textile/powergate-client';
import { Powergate } from '../pin/powergate';
import { Resolver } from 'did-resolver';
import AstralClient from '../astral-client';
import { DID } from 'dids';

export interface Context {
    did?: DID;
    astral?: AstralClient;
    transformer?: Transformer;
    powergate?: Powergate;
    token?: any;
    resolver?: Resolver;
}
