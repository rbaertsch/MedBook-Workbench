 
/*****************************************************************************/
/* Scv: Event Handlers and Helpersss .js*/
/*****************************************************************************/
Template.Scv.events({
	'click #createGroup': function( e, tmpl){
		var g1 = Session.get('studyGroup1');
		var g2 = Session.get('studyGroup2');
		var contrast_name = g1+' vs '+g2;
		var studyID = Session.get('studyID');
		var sampleList1 = _.pluck(SampleGroups.find({group:g1}).fetch(), 'sample');
		var sampleList2 = _.pluck(SampleGroups.find({group:g2}).fetch(), 'sample');
		//var sampleList2 = SampleGroups.find({group:g2},{'sample':1}).fetch();
		if (Meteor.user()) {		
			var collabs = Meteor.user().profile.collaborations;
			// FIX ME - default to first collaboration
			var collab = collabs[0]
		}
		else {
			collab = []
		}
		console.log('contrast: '+contrast_name);
		console.dir('samples for group '+g1+' :'+sampleList1);
		Contrast.insert({'name':contrast_name,'studyID':studyID,'collaborations': collab,
			'group1':g1,'group2':g2,'list1':sampleList1,'list2':sampleList2,  userId: Meteor.userId()} , function(error, result) {
				if (error)
					console.log('insert contrast error: ' , error);
			});
	},
	'change .dropdown-menu': function(e, t) {
		debugger;
	},
    'change #group1': function (e,t) {
		var sg = t.$( "#group1 option:selected" ).text();
	   Session.set('studyGroup1',sg.trim());
	   console.log('selected group1'+sg);
	},
    'change #group2': function (e,t) {
		var sg = t.$( "#group2 option:selected" ).text();
	   Session.set('studyGroup2',sg.trim());
	   console.log('selected group2'+sg);
	},
	'change #contrast1': function(e,t){
		var c = t.$( "#contrast1 option:selected" ).text();
		Session.set('selectedContrast',e.target.value);
		console.log('switch contrasts:',c);
	},
    'change .dropdown-menu': function (e,t) {
		var tool = t.$( "#job option:selected" ).text();
	   Session.set('tool',tool.trim());
	   console.log('selected tool'+tool);
	}
});

Template.Scv.helpers({
  /*
   * Example:
   *  items: function () 
   *    return Items.find();
   *  
   */
 	sampleGroups: function(g1,g2) {
	  console.log('find sampleGroups:',g1,' ',g2)
  	return SampleGroups.find({group: g1});
	},
	isSelected: function(item){
		console.log ("SCV IS_SELECTED",item);
	},
	contrast_id: function() {
		return Session.get('selectedContrast');
	},
	selectedContrast: function() {
		var id = Session.get('selectedContrast');
		console.log('contrast id ',id);
		return Contrast.findOne({_id: id });
	},
	name: function() {
		var id = Session.get('selectedContrast');
		var c =  Contrast.findOne({_id: id });
		if (c)
			return c.name
		return
	},
	selectedContrastId: function() {
		return Session.get('selectedContrast');
	}

});

/*****************************************************************************/
/* Scv: Lifecycle Hooks */
/*****************************************************************************/
Template.Scv.created = function () {
};

Template.Scv.rendered = function () {
};

Template.Scv.destroyed = function () {
};


