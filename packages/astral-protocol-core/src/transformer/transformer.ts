import { Powergate } from '../pin/powergate';
import { plainToClass } from 'class-transformer';
import { GeoDoctypeUtils } from '../geo-did-utils/utils';
import { IStacItemMetadata, IGeometry, IProperties, IServiceEndpoint, IAssetList } from '../geo-did-utils/geo-did-spec';
import { fetchAsset } from '../scripts/fetch';
import { RootObject, AssetType, Assets, Properties } from './stac-item-spec';
import { Context } from '../context/context';
import cliProgress from 'cli-progress';

export class Transformer {

    private geoDIDid: string;

    stacItemMetadata: IStacItemMetadata;
    geometry: IGeometry;
    properties: IProperties;
    private assets: Assets;

    services: IServiceEndpoint[] = new Array(5);
    assetList: IAssetList[] = new Array(5);

    constructor(private _stacjsonObj: any) {
        this.assets = this._stacjsonObj.getAssets();
        this.createAssetList();

        this.setGeometry();
        this.setProperties();

        this.setStacItemMetadata();
    }

    static async build(jsonObj: Object): Promise<any>{
        const stacjsonObj = plainToClass(RootObject, jsonObj);
        return new Transformer(stacjsonObj)
    }

    // TODO: Figure out a more effective way to create the AssetList
    async createAssetList() {
        this.assetList[0] = this.assets.getThumbnail();
        this.assetList[1] = this.assets.getAnalytic();
        this.assetList[2] = this.assets.getAnalyticXml();
        this.assetList[3] = this.assets.getUdm();
        this.assetList[4] = this.assets.getVisual();
    }

    async getAssetList(): Promise<IAssetList[]> {
        return this.assetList;
    }

    async getGeoDIDid(_id: string, _ethereumAddress: string): Promise<string> {
        const geoId = await GeoDoctypeUtils.createGeodidIdFromGenesis(_id);
        this.geoDIDid = GeoDoctypeUtils.normalizeDocId(geoId);
        return this.geoDIDid;
    }

    // setter for the Geometry
    async setGeometry() {
        this.geometry = await this.getGeometry();
    }

    async getGeometry(): Promise<IGeometry> {
        return this.geometry;
    }

    // setter for the Properties
    async setProperties() {
        this.properties = await this._stacjsonObj.getProperties();
    }

    async getProperties(): Promise<IProperties> {
        return this.properties;
    }

    // setter for the Assets
    async setService(index: number) {
        this.services[index] = {
            // TODO: Please fix the service endpoint generator later
            id: this.geoDIDid + `#${this.assetList[index].roles[0]}`, // this will work for demo but not production
            type: this.assetList[index].type,
            serviceEndpoint: this.assetList[index].href,
            description: this.assetList[index].title,
            role: this.assetList[index].roles,
            //'pl.type': serviceList[i].('pl:type')
        };
    }

    // use this to pin the services
    async getServices(): Promise<IServiceEndpoint[]> {
        return this.services;
    }

    // setter for the StacItemMetadata
    async setStacItemMetadata() {
        this.stacItemMetadata = {
            stac_version: await this._stacjsonObj.getStacVersion(),
            stac_extensions: await this._stacjsonObj.getStacExtensions(),
            type: await this._stacjsonObj.getType(),
            id: await this._stacjsonObj.getId(),
            bbox: await this._stacjsonObj.getBbox(),
            geometry: await this.getGeometry(),
            collection: await this._stacjsonObj.getCollection(),
            properties: await this.getProperties(),
        };
    }

    // add to this the document later
    async getStacItemMetadata(): Promise<IStacItemMetadata> {
        return this.stacItemMetadata;
    }

    async getGeoDidId(): Promise<string> {
        return this.geoDIDid;
    }

    async assetToService() {
        for (let i = 0; i < this.assetList.length; i++) {
            await this.setService(i);
        }
    }

    /*
    async pinDocumentAssets(){
        console.log("Asset Pinning Progress: ")
        const b1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic,);
         
        // initialize the bar - defining payload token "speed" with the default value "N/A"
        b1.start(1000, 0, {
            speed: "N/A"
        });

        for (let i = 0; i < this.assetList.length; i++){
            try {
                var blob = await fetchAsset(this.assetList[i].href)
                b1.increment(100);
                var buffer = await blob.arrayBuffer();
                b1.increment(25);
                let uint8 = new Uint8Array(buffer);

                const cid = await this.powergate.getAssetCid(uint8)
                b1.increment(25);
                //console.log(cid)

                await this.powergate.pin(cid)
                b1.increment(35);
                await this.setService(i, cid)
                b1.increment(15);

            }catch(err){
                console.log(err)
            }
        }
        b1.update(1000);
        b1.stop();
    }*/
}
