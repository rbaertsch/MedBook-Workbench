CohortController = RouteController.extend({
	
    waitOn : function() {
		var geneList = Session.get('geneList');
		var studyID = Session.get('studyID');
		var contrastID = Session.get('selectedContrast');
		//var geneList = ['PEG10', 'KCNJ6', 'FGF9', 'CNKSR3', 'ANK2', 'ST8SIA4', 'RUNX1T1', 'GPRIN2', 'KIT', 'GABRB3', 'IPCEF1', 'GRIN3A', 'CACHD1', 'GYG2', 'ADM', 'F2RL1', 'TMPRSS2', 'TEAD2', 'DHODH', 'FXYD3', 'SERTAD1', 'NQO1', 'DHCR24', 'BANK1', 'INO80C', 'SLC30A4', 'F5', 'HK2', 'PPARG', 'CXCL2', 'FGFRL1', 'NNMT', 'PFKFB4', 'PRR5', 'SPINK1', 'OPHN1', 'KLRB1', 'ERP27', 'SELL', 'IRAK2', 'APOH', 'HSH2D', 'REEP6', 'KLK3', 'MAFK', 'ATP2C2', 'AGR2', 'ACOT9', 'ANG', 'CEACAM1'];
		//Meteor.subscribe('clinical_events_index');
        	Meteor.subscribe('expression2', geneList, studyID);
		console.log('subscribe study ', studyID, 'expression2', geneList)
        	Meteor.subscribe('correlator', studyID, contrastID, 5);
		console.log('subscribe correlator ', studyID, 'contrast', contrastID)
    },

    data : function() {
    },

    action : function() {
        this.render();
    }
});
