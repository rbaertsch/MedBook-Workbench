/*****************************************************************************/
/* Client and Server Routes */
/*****************************************************************************/
Router.configure({
  layoutTemplate: 'MasterLayout',
  loadingTemplate: 'Loading',
  notFoundTemplate: 'NotFound',
  templateNameConverter: 'upperCamelCase',
  routeControllerNameConverter: 'upperCamelCase'
});

/*Router.onBeforeAction(function() {
	console.log('BEFORE route: ',this.path);
	
});*/
Router.map(function () {
  /*
    Example:
      this.route('home', {path: '/'});
  */
  this.route('studies.index', {path: '/wb'});
  this.route('scv', {path: '/wb/scv'});
  this.route('sample.groups.index', {path: '/wb/sampleGroups/:study/:name'});
  this.route('clinical.events.index', {path: '/wb/clinical'});
  this.route('shell', {path: '/wb/shell'});
  this.route('genes', {path: '/wb/gene'});
  this.route('drugs', {path: '/wb/drug'});
  this.route('cohort', {path: '/wb/cohort'});
  this.route('pathways', {path: '/wb/pathway'});
  this.route('patient.index', {path: '/wb/patient/'})
  this.route('patient', {path: '/wb/patient/:name'})
  this.route('signature.index', {path: '/wb/signature'});
  this.route('SignatureForm', {path: '/wb/signatureForm'});
  this.route('signature.scores.index', {path: '/'});
});
