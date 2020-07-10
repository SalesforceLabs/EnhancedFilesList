import { LightningElement, api, track } from 'lwc';

export default class PhotoModal extends LightningElement {
    @api clickedImageUrl;
    @api displayFileName;

    @track displayPlaceholderImage = false;

    closeModal(){
        this.dispatchEvent(new CustomEvent('selected'));
    }

    diplayImgPlaceholder(){
        this.displayPlaceholderImage = true;
    }
}