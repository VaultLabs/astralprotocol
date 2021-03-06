import bs58 from 'bs58';
import web3 from 'web3';
import { GeoDocument } from '../geo-document';
import { ParsedDID, DIDResolver, DIDDocument } from 'did-resolver';
import { IStacItemMetadata, IServiceEndpoint } from '../geo-did-utils/geo-did-spec';

// contract address

interface GeoDIDDocument extends DIDDocument {
    stacmetadata: IStacItemMetadata;
    service: IServiceEndpoint[];
}

interface ResolverRegistry {
    [index: string]: DIDResolver;
}

export function geoload() {}

export function wrapDocument(
    stacmetadata: IStacItemMetadata,
    service: IServiceEndpoint[],
    did: string,
    address: string
): GeoDIDDocument {
    const startDoc: GeoDIDDocument = {
        '@context': 'https://w3id.org/did/v1',
        id: did,
        publicKey: [],
        authentication: [],
        service: service,
        stacmetadata: stacmetadata,
    };

    // replace the public key with the ethereum address
    startDoc.publicKey.push({
        id: `${did}#` + `${address}`,
        type: 'Secp256k1VerificationKey2018',
        controller: did,
        // remove multicodec variant and encode to hex
        publicKeyHex: `${address}`,
    });

    return startDoc;
}

// pass in a instance of astral into
export default {
    getResolver: (document: GeoDocument): ResolverRegistry => ({
        geo: async (did: string, parsed: ParsedDID): Promise<DIDDocument | null> => {
            // resolver
            const stacitemmetadata = await document.getStacItemMetadata();
            const services = await document.getServices();
            const address = await document.getAddress();
            return wrapDocument(stacitemmetadata, services, did, address);
        },
    }),
};

// did:geo:QmQhrMWAyxPRpFnS1UPZSUmKj7N7DNNSWi2cfQYDMR4Zgm fragment: 'fragment=data'

// {method: 'geo', id: 'cid', did: 'did:geo:abcdefg/service/#fragment=123', path: '/some/path', fragment: 'fragment=123'}*/
