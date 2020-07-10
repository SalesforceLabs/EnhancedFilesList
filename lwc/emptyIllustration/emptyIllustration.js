import { LightningElement, api } from 'lwc';
import EMPTY_STATE_SVG from '@salesforce/resourceUrl/openRoad';

export default class EmptyIllustration extends LightningElement {
    @api tite;
    @api body;
    
    emptyStateImgUrl = EMPTY_STATE_SVG;
}