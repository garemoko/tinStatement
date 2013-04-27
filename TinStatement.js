/*
=============COPYRIGHT============ 
Tin Statement Sender - An I-Did-This prototype for Tin Can API 0.95
Copyright (C) 2012  Andrew Downes

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
<http://www.gnu.org/licenses/>.
*/


/*============DOCUMENT READY==============*/
$(function(){
	
	
	//Set Up LRS
	//Add one blank LRS to the page by default
	appendLRS();
	//When the user clicks '+LRS', append an extra LRS
	$('#lrsLrsAdd').click(appendLRS);
	$('#lrsLrsRemove').click({elementId: 'lrs', propertyClass: 'lrs', minimum:1},removeProperty);
	getLRSFromQueryString();
	
	
	//Set up Actor
	appendGroup('actorAgent').addClass('displayNone');
	appendAgent('actorAgent');
	$('#actorObjectType').change({elementId: 'actor'},ObjectTypeChanged);
	$('#actorAgentAdd').click({elementId: 'actorAgent'},appendAgentOnEvent);
	$('#actorAgentRemove').click({elementId: 'actorAgent', propertyClass: 'agent', minimum:1},removeProperty);

	//Set up Verb
	var languageMap = new Array();
	languageMap[0] = "en-GB";
	languageMap[1] = "en-US";
	//Add 2 fields to start with
	appendLanguageMap('verb','display',2, languageMap);
	$('#verbDisplayAdd').click({elementId: 'verb', propertyClass: 'display', languageMap: languageMap},appendLanguageMapOnEvent); 
	$('#verbDisplayRemove').click({elementId: 'verb', propertyClass: 'display', minimum:0},removeProperty);
	
	
	//set up Object
	$('#objectType').change({elementId: 'object'},ObjectTypeChanged);
	//activity
	appendLanguageMap('activity','name',2, languageMap);
	$('#activityNameAdd').click({elementId: 'activity', propertyClass: 'name', languageMap: languageMap},appendLanguageMapOnEvent); 
	$('#activityNameRemove').click({elementId: 'activity', propertyClass: 'name', minimum:0},removeProperty);
	appendLanguageMap('activity','description',2, languageMap);
	$('#activityDescriptionAdd').click({elementId: 'activity', propertyClass: 'description', languageMap: languageMap},appendLanguageMapOnEvent); 
	$('#activityDescriptionRemove').click({elementId: 'activity', propertyClass: 'description', minimum:0},removeProperty);
	
	var extensionMap = new Array();
	//appendLanguageMap('activity','activityExtension',2, extensionMap);
	$('#activityExtensionRemove').addClass('displayNone')
	$('#activityExtensionAdd').click({elementId: 'activity', propertyClass: 'extension', languageMap: extensionMap},appendLanguageMapOnEvent); 
	$('#activityExtensionRemove').click({elementId: 'activity', propertyClass: 'extension', minimum:0},removeProperty);
	
	//Agent/Group
	appendGroup('objectAgent').addClass('displayNone');
	appendAgent('objectAgent');
	$('#objectAgentAdd').click({elementId: 'objectAgent'},appendAgentOnEvent);
	$('#objectAgentRemove').click({elementId: 'objectAgent', propertyClass: 'agent', minimum:1},removeProperty);



	//send statement
	$('#sendStatement').click(statementGeneratorSendStatement);
	
	//Set debug defaults
	var setDebugDefaults = true;
	
	if (setDebugDefaults){
		$('#endpoint0').val('http://cloud.scorm.com/ScormEngineInterface/TCAPI/public/');
		$('#basicLogin0').val('x');
		$('#basicPass0').val('x');
		$('#actorAgentName1').val('Andrew Downes');
		$('#actorAgentFunctionalIdentifier1').val('mrdownes@hotmail.com');
		$('#verbId').val('http://tincanapi.co.uk/tinrepo/verbs/make_moderator');
		$('#verbDisplayValue0').val('make moderator');
		$('#verbDisplayValue1').val('make moderator');
		$('#activityId').val('http://tincanapi.co.uk/exampleactivity');
		$('#activityType').val('http://tincanapi.co.uk/exampleactivity');
		$('#activityNameValue0').val('example activity');
		$('#activityNameValue1').val('example activity');
	}
	
});
/*============END DOCUMENT READY==============*/


/*============SEND STATEMENT==============*/
function statementGeneratorSendStatement()
{

	//Create an instance of the Tin Can Library
	var myTinCan = new TinCan();
	
	myTinCan.DEBUG = 1;
	
	//LRS
	$('#lrs').find('.lrs').each(function(index){
		var myLRS = new TinCan.LRS({
			endpoint:$(this).find('.endpoint').val(), 
			version: "0.95",
			auth: 'Basic ' + Base64.encode($(this).find('.basicLogin').val() + ':' + $(this).find('.basicPass').val())
		});
		myTinCan.recordStores[index] = myLRS;
	});
	
	
	switch($('#actorObjectType').val())
	{
		case 'Agent':
			myActor = getActor($('#actor').find('.agent:first'));
		break;
		case 'Group':
		console.log('1');
			var myActor = getActor($('#actor').find('.group:first'), 'Group');
			console.log(JSON.stringify(myActor));
			 $('#actor').find('.agent').each(function(index){
			 	var agentToAddToGroup = getActor($(this));
				myActor.member.push(agentToAddToGroup);
			 });
		break;
	}
	myTinCan.actor = myActor;
	
	

	//verb
	var myVerbDisplay = new Object();
	$('#verb').find('.display').each(function(index) {
	   myVerbDisplay[$(this).find('.displayKey').val()] = $(this).find('.displayValue').val()
	 });
	 myVerbDisplay = deleteEmptyProperties(myVerbDisplay);
	var myVerb = new TinCan.Verb({
		id : $('#verb').find('.verbId').val(),
		display : myVerbDisplay
	});
	 
	
	//Object
	//TODO: ADD OTHER OBJECT TYPES
	var myTarget;
	
	switch ($('#objectType').val())
	{
		case "Activity":
			//activity
			//Create the activity definition
			var myActivityDefinitionName = new Object();
			 $('#activity').find('.name').each(function(index) {
			   myActivityDefinitionName[$(this).find('.nameKey').val()] = $(this).find('.nameValue').val()
			 });
			 var myActivityDefinitionDescription = new Object();
			 $('#activity').find('.description').each(function(index) {
			   myActivityDefinitionDescription[$(this).find('.descriptionKey').val()] = $(this).find('.descriptionValue').val()
			 });
			 var myActivityDefinitionExtensions = new Object();
			  $('#activity').find('.extension').each(function(index) {
			   myActivityDefinitionExtensions[$(this).find('.extensionKey').val()] = $(this).find('.extensionValue').val()
			 });
			 
			 var myActivityDefinition = new TinCan.ActivityDefinition({
				type : $('#activity').find('.activityType').val(),
				name:  myActivityDefinitionName,
				description:  myActivityDefinitionDescription,
				extensions:  myActivityDefinitionExtensions
			});
			
			//Create the activity
			var myActivity = new TinCan.Activity({
				id : $('#activity').find('.activityId').val(),
				definition : myActivityDefinition
			});
			
			myTarget = myActivity;
		break;
		case "Agent":
			var myObjectAgent = getActor($('#objectAgent').find('.agent:first'));
			myTarget = myObjectAgent;
		break;
		case 'Group':
			var myObjectAgent = getActor($('#objectAgent').find('.group:first'), 'Group');
			 $('#objectAgent').find('.agent').each(function(index){
			 	var agentToAddToGroup = getActor($(this));
				myObjectAgent.member.push(agentToAddToGroup);
			 });
		break;
		
	}
	
	console.log ('myActor: ' + JSON.stringify(myActor));
	console.log ('target: ' + JSON.stringify(deleteEmptyProperties(myTarget)));
	var stmt = new TinCan.Statement({
		actor : deleteEmptyProperties(myActor),
		verb : deleteEmptyProperties(myVerb),
		target : deleteEmptyProperties(myTarget)
	},true);
	
	console.log ('sending: ' + JSON.stringify(stmt));
	
	myTinCan.sendStatement(stmt, function() {});
}

