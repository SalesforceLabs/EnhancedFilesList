import { LightningElement, track } from 'lwc';
import EMPTY_STATE_SVG from '@salesforce/resourceUrl/openRoad';

export default class NoFilesView extends LightningElement {

    @track emptyStateImgUrl = EMPTY_STATE_SVG;
    @track filesModal = false;

}