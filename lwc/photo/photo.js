import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import FORM_FACTOR from "@salesforce/client/formFactor";

export default class Photo extends NavigationMixin(LightningElement) {

    @api contentId;
    @api contentDocumentId;
    @api community;

    @track clickedImageUrl;
    @track isImageClicked = false;
    @track prefixUrl = `/sfc/servlet.shepherd/version/renditionDownload?rendition=thumb720by480&versionId=`;
    @track thumbnailPrefixUrl = `/sfc/servlet.shepherd/version/renditionDownload?rendition=thumb120by90&versionId=`;
    
    @track imageUrl;
    @track displayPlaceholderImage = false;

    connectedCallback(){
        this.imageUrl = `${this.thumbnailPrefixUrl}${this.contentId}`;
    }

    imageClick(){
        if (this.community) {
            this.isImageClicked = true;
            this.clickedImageUrl = `${this.prefixUrl}${this.contentId}`;
            console.log(this.clickedImageUrl);
        }
        else {
            if(FORM_FACTOR !== 'Small'){
                this[NavigationMixin.Navigate]({
                    type: 'standard__namedPage',
                    attributes: {
                        pageName: 'filePreview'
                    },
                    state : {
                        recordIds: this.contentDocumentId
                    }
                })
            }
        }
    }

    handleModalClosed(){
        this.isImageClicked=false;
    }

    diplayImgPlaceholder(){
        this.displayPlaceholderImage = true;
    }
}