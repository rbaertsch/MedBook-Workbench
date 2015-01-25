/*****************************************************************************/
/* SignatureIndex Publish Functions
/*****************************************************************************/

Meteor.publish('signature_index', function (study) {
  // you can remove this if you return a cursor
	var sg = null;
	var cnt = 0;
	try {
		sg = Signature.find({'studyID':study})
		cnt = Signature.find({'studyID':study}).count()
		 console.log('Signature count for study', study,  cnt);
	}
	catch(error) {
		sg = Signature.find();
 	    cnt = Signature.find().count();
	}
  console.log('Signature count', cnt);
  return sg;
});

