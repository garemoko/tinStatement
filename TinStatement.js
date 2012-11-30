/*
=============COPYRIGHT============ 
Tin Book - An I-Read-This prototype for Tin Can API
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
	appendGroup('actor').addClass('displayNone');
	appendAgent('actor');
	$('#actorObjectType').change({elementId: 'actor'},ObjectTypeChanged);
	$('#actorAgentAdd').click({elementId: 'actor'},appendAgentOnEvent);
	$('#actorAgentRemove').click({elementId: 'actor', propertyClass: 'agent', minimum:0},removeProperty);

	//Set up Verb
	var languageMap = new Array();
	languageMap[0] = "en-GB";
	languageMap[1] = "en-US";
	//Add 2 fields to start with
	appendLanguageMap('verb','verbDisplay',2, languageMap);
	$('#verbVerbDisplayAdd').click({elementId: 'verb', propertyClass: 'verbDisplay', languageMap: languageMap},appendLanguageMapOnEvent); 
	$('#verbVerbDisplayRemove').click({elementId: 'verb', propertyClass: 'verbDisplay', minimum:0},removeProperty);
	
	
	//set up Object
	$('#objectType').change({elementId: 'object'},ObjectTypeChanged);
	//activity
	appendLanguageMap('activity','activityName',2, languageMap);
	$('#activityActivityNameAdd').click({elementId: 'activity', propertyClass: 'activityName', languageMap: languageMap},appendLanguageMapOnEvent); 
	$('#activityActivityNameRemove').click({elementId: 'activity', propertyClass: 'activityName', minimum:0},removeProperty);
	appendLanguageMap('activity','activityDescription',2, languageMap);
	$('#activityActivityDescriptionAdd').click({elementId: 'activity', propertyClass: 'activityDescription', languageMap: languageMap},appendLanguageMapOnEvent); 
	$('#activityActivityDescriptionRemove').click({elementId: 'activity', propertyClass: 'activityDescription', minimum:0},removeProperty);
	
	var extensionMap = new Array();
	//appendLanguageMap('activity','activityExtension',2, extensionMap);
	$('#activityActivityExtensionRemove').addClass('displayNone')
	$('#activityActivityExtensionAdd').click({elementId: 'activity', propertyClass: 'activityExtension', languageMap: extensionMap},appendLanguageMapOnEvent); 
	$('#activityActivityExtensionRemove').click({elementId: 'activity', propertyClass: 'activityExtension', minimum:0},removeProperty);
	
	//Agent/Group
	appendGroup('objectAgent').addClass('displayNone');
	appendAgent('objectAgent');
	$('#objectAgentAdd').click({elementId: 'objectAgent'},appendAgentOnEvent);
	$('#objectAgentRemove').click({elementId: 'objectAgent', propertyClass: 'agent', minimum:0},removeProperty);



	//send statement
	$('#sendStatement').click(statementGeneratorSendStatement);
});
/*============END DOCUMENT READY==============*/

function getLRSFromQueryString()
{
	var lrs = $.getUrlVar('lrs');
	if (!(lrs == undefined))
	{
		lrs = JSON.parse(urldecode(lrs));
		for (var i=1;i<lrs.length;i++)
		{
			appendLRS();
		}
		$('#lrs').find('.lrs').each(function(index){
			$(this).find('.endpoint').val(lrs[index].endpoint); 
			$(this).find('.basicLogin').val(lrs[index].login);
			$(this).find('.basicPass').val(lrs[index].pass);
		});
	}
}


function ObjectTypeChanged (event)
{
	var elementId = event.data.elementId;
	
	//Hide all subsections (if they exist)
	$('#' + elementId).find('.activitySubSection').addClass('displayNone');
	$('#' + elementId).find('.agentSubSection').addClass('displayNone');
	
	switch($(this).val())
	{
	case 'Agent':
		//display agentsubsection (if found)
		$('#' + elementId).find('.agentSubSection').removeClass('displayNone');
		//hide group
		$('#' + elementId).find('.group').addClass('displayNone');
		//hide extra agents 
		$('#' + elementId).find('.agent').slice(1).addClass('displayNone')
		//hide add/remove buttons
		$('#' + elementId + 'AgentAdd').addClass('displayNone');
		$('#' + elementId + 'AgentRemove').addClass('displayNone');
		//If all agents have been removed (in group mode) then add one. 
		if ($('#' + elementId).find('.agent').length < 1)
		{
			appendAgent(elementId);
		}
				
	break;
	case 'Group':
	//display agentsubsection (if found)
		$('#' + elementId).find('.agentSubSection').removeClass('displayNone');
		//reveal group
		$('#' + elementId).find('.group').removeClass('displayNone');
		//reveal all agents
		$('#' + elementId).find('.agent').removeClass('displayNone');
		//reveal add/remove buttons
		$('#' + elementId + 'AgentAdd').removeClass('displayNone');
		if ($('#' + elementId).find('.agent').length > 0)
		{
			$('#' + elementId + 'AgentRemove').removeClass('displayNone');
		}
	break;	
	case 'Activity':
		//display activitysubsection (if found)
		$('#' + elementId).find('.activitySubSection').removeClass('displayNone');
	break;
	}
		
}

function appendLanguageMapOnEvent(event)
{
	appendLanguageMap(event.data.elementId, event.data.propertyClass, event.data.loop, event.data.languageMap)
}

function appendLanguageMap(elementId,propertyClass,loop,languageMap)
{	
	var capitalizedPropertyClass = capitaliseFirstLetter(propertyClass);
	
	loop = typeof loop !== 'undefined' ? loop : 1;
	
	for (var i=0;i<loop;i++)
	{
		var propertyCount = $('#' + elementId).parent().find('.' + propertyClass).length;
		var language = typeof languageMap[propertyCount] !== 'undefined' ? languageMap[propertyCount] : "";
		
		$('#' + elementId + capitalizedPropertyClass + 'ButtonHolder').before('\
			<tr class="' + propertyClass + '">\
				<td class="label">\
					<input type="text" name="' + elementId + 'Key' + propertyCount + '" id="' + elementId + capitalizedPropertyClass + 'Key' + propertyCount + '" value="' + language + '" class="'+ propertyClass + 'Key" />\
				</td>\
				<td>\
					<input type="text" name="' + elementId + 'Value' + propertyCount + '" id="' + elementId + capitalizedPropertyClass + 'Value' + propertyCount + '" class="' + propertyClass + 'Value" />\
				</td>\
			</tr>\
		');
		
		//Show the '-' button 
		$('#' + elementId + capitalizedPropertyClass + 'Remove').removeClass('displayNone');
	}
}

function appendAgentOnEvent(event)
{
	appendAgent(event.data.elementId)
}

function appendAgent(elementId)
{
	var propertyCount = $('#' + elementId).find('.agent').length;
	
	var newAgent = $('\
		<div class="agent">\
				<h3>Agent ' + (propertyCount + 1) + '</h3>\
				<table>\
					<tr>\
						<td class="label">Name:</td>\
						<td>\
						<input type="text" name="' + elementId + 'Name' + propertyCount + '" id="' + elementId + 'Name' + propertyCount + '" class="name"/>\
						</td>\
					</tr>\
					<tr class="groupHideable">\
						<td class="label">mbox:</td>\
						<td>\
						<input type="text" name="' + elementId + 'Mbox' + propertyCount + '" id="' + elementId + 'Mbox' + propertyCount + '" class="mbox"/>\
						</td>\
					</tr>\
					<tr class="agentHideableShowButton">\
						<td colspan="2" class="buttonHolder">\
						<input type="button" value="More..." name="' + elementId + 'Show' + propertyCount + '" id="' + elementId + 'Show' + propertyCount + '" class="button" />\
						</td>\
					</tr>\
					<tr class="agentHideable displayNone">\
						<td class="label">Mbox_sha1sum:</td>\
						<td>\
						<input type="text" name="' + elementId + 'Mbox_sha1sum' + propertyCount + '" id="' + elementId + 'Mbox_sha1sum' + propertyCount + '" class="mbox_sha1sum"/>\
						</td>\
					</tr>\
					<tr class="agentHideable displayNone">\
						<td class="label">openid:</td>\
						<td>\
						<input type="text" name="' + elementId + 'Openid' + propertyCount + '" id="' + elementId + 'Openid' + propertyCount + '" class="openid"/>\
						</td>\
					</tr>\
					<tr class="agentHideable displayNone">\
						<td class="label label_heading">account:</td>\
					</tr>\
					<tr class="agentHideable displayNone">\
						<td class="label">homePage:</td>\
						<td>\
						<input type="text" name="' + elementId + 'AccountHomePage' + propertyCount + '" id="' + elementId + 'AccountHomePage' + propertyCount + '" class="accountHomePage"/>\
						</td>\
					</tr>\
					<tr class="agentHideable displayNone">\
						<td class="label">name:</td>\
						<td>\
						<input type="text" name="' + elementId + 'AccountName' + propertyCount + '" id="' + elementId + 'AccountName' + propertyCount + '" class="accountName"/>\
						</td>\
					</tr>\
					</tr>\
					<tr class="agentHideableHideButton displayNone">\
						<td colspan="2" class="buttonHolder">\
						<input type="button" value="Hide" name="' + elementId + 'Hide' + propertyCount + '" id="' + elementId + 'Hide' + propertyCount + '" class="button"/>\
						</td>\
					</tr>\
				</table>\
			</div>\
	').appendTo('#' + elementId);
	
	//enable show button
	$('#' + elementId + 'Show' + propertyCount).click(function(){
		$(this).closest('table').find('.agentHideable, .agentHideableHideButton').removeClass('displayNone');
		$(this).closest('tr').addClass('displayNone');
	});
	
	//enable hide button
	$('#' + elementId + 'Hide' + propertyCount).click(function(){
		$(this).closest('table').find('.agentHideable').addClass('displayNone');
		$(this).closest('table').find('.agentHideableShowButton').removeClass('displayNone');
		$(this).closest('tr').addClass('displayNone');
	});
	
	
	//If this is a group, ensure the removeAgent button is visible as groups can have 0 agents
	if ($('#'+elementId + 'ObjectType').val() == 'Group')
	{
		$('#' + elementId  + 'AgentRemove').removeClass('displayNone');
	}
	
	return newAgent;
}

function appendGroup(elementId)
{
	//Create an Agent
	var Group = appendAgent(elementId);
	var GroupIndex = Group.index($('#'+elementId).find('.agent'));
	//change its class
	Group.removeClass('agent').addClass('group');
	//change its heading
	Group.find('h3').text('Group Details');
	//add to the hidden fields
	Group.find('.groupHideable').addClass('agentHideable displayNone');
	//Move the "show" button up one
	var rowToMove = Group.find('.agentHideableShowButton')
	rowToMove.prev().insertAfter(rowToMove);
	//change the ids of the show/hide buttons
	$('#' + elementId + 'Show' + GroupIndex).attr('id',elementId + 'ShowGroup'+ GroupIndex).attr('name',elementId + 'ShowGroup'+ GroupIndex);
	$('#' + elementId + 'Hide' + GroupIndex).attr('id',elementId + 'HideGroup'+ GroupIndex).attr('name',elementId + 'HideGroup'+ GroupIndex);
	return Group;
}


function appendLRS()
{
	var lrsCount = $('.lrs').length;
	
	var newLrs = $('\
		<div class="lrs">\
				<h3>LRS '+ (lrsCount + 1) + '</h3>\
				<table>\
					<tr>\
						<td class="label">Endpoint:</td>\
						<td>\
						<input type="text" name="endpoint'+ lrsCount + '" id="endpoint'+ lrsCount + '" class="required endpoint"/>\
						</td>\
					</tr>\
					<tr>\
						<td class="label">Basic Login:</td>\
						<td>\
						<input type="text" name="basicLogin'+ lrsCount + '" id="basicLogin'+ lrsCount + '" class="required basicLogin" />\
						</td>\
					</tr>\
					<tr>\
						<td class="label">Basic Password:</td>\
						<td>\
						<input type="text" name="basicPass'+ lrsCount + '" id="basicPass'+ lrsCount + '" class="required basicPass"/>\
						</td>\
					</tr>\
				</table>\
			</div>\
	').appendTo('#lrs');
	
	//Show the '-LRS' button if there is now more than 1 LRS
	if (lrsCount > 0)
	{
		$('#lrsLrsRemove').removeClass('displayNone');
	}
	return newLrs;
}


function removeProperty(event)
{	
	//get paremters
	var elementId = event.data.elementId;
	var propertyClass = event.data.propertyClass;
	var capitalizedPropertyClass = capitaliseFirstLetter(propertyClass);
	
	//get and count elements
	var propertyArray = $('#' + elementId).find('.' + propertyClass),
	propertyCount = propertyArray.length;
	
	//Hide the '-' button if this function will reduce us to the minimum
	if (propertyCount < (event.data.minimum + 2))
	{
		$('#' + elementId  + capitalizedPropertyClass + 'Remove').addClass('displayNone');
	}
	
	//start at the top and loop through LRSes
	propertyArray.each(function(index){
		//if lrs fields are empty or we have reached last lrs
		if (index == (propertyCount-1))
		{
			//TODO: add Are you sure?
			$(this).remove();
		}
		else if (areAllInputsEmpty($(this)))
		{
			//shuffle all values up one item
			bubbleInputValuesUp(propertyArray.slice(index));
			//remove the last item
			$(propertyArray[propertyCount-1]).remove();
		}
	});
}

//Checks if all inputs within a Jquery Object are empty
function areAllInputsEmpty(jqueryObjectToTest)
{
	var allEmpty = true;
	jqueryObjectToTest.find("input[type=text]").each(function(index){
		if (!($(this).val() == ""))
		{
			allEmpty = false;
		}
	});
	
	//TODO: check other input types and selects
	
	return allEmpty;
	
}

function bubbleInputValuesUp(objectArray)
{
	//first pass - Get all values
	var valuesArray = new Array();	
	objectArray.each(function(objectArrayIndex){
		//if not first item
		if (!(objectArrayIndex==0))
		{
			valuesArray[objectArrayIndex] = new Array();	
			$(this).find("input[type=text]").each(function(inputIndex){
				valuesArray[objectArrayIndex][inputIndex] = $(this).val();
			});
		}
	});
	
	//second pass - Set values
	var objectArrayLength  = objectArray.length;
	objectArray.each(function(objectArrayIndex){
		//if not last item
		if (!(objectArrayIndex==(objectArrayLength-1)))
		{
			valuesArray[objectArrayIndex] = new Array();	
			$(this).find("input[type=text]").each(function(inputIndex){
				$(this).val(valuesArray[objectArrayIndex + 1][inputIndex]);
			});
		}
	});
	
}

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function urldecode(str) {
   return decodeURIComponent((str+'').replace(/\+/g, '%20'));
}

//removes any empty properties 
function deleteEmptyProperties(objectToTest)
{
	for (i in objectToTest) {
 		if (objectToTest[i] == null || objectToTest[i] == "" || (JSON.stringify(objectToTest[i])=="{}")) {
    		delete objectToTest[i];
  		}
	}
	return objectToTest;
}

$.extend({
  getUrlVars: function(){
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function(name){
    return $.getUrlVars()[name];
  }
});

function statementGeneratorSendStatement()
{
	/*============SEND STATEMENT==============*/
	
	
	//Create an instance of the Tin Can Library
	var myTinCan = new TinCan();
	
	myTinCan.enableDebug = 1;
	
	//LRS
	$('#lrs').find('.lrs').each(function(index){
		var myLRS = new TinCan.LRS({
			endpoint:$(this).find('.endpoint').val(), 
			version: "0.95",
			auth: 'Basic ' + Base64.encode($(this).find('.basicLogin').val() + ':' + $(this).find('.basicPass').val())
		});
		myTinCan.recordStores[index] = myLRS;
	});
	
	
	//actor
	switch($('#actorObjectType').val())
	{
		case 'Agent':
			var myActor = new TinCan.Agent({
				name : $('#actor').find('.agent:first').find('.name').val(),
				mbox : $('#actor').find('.agent:first').find('.mbox').val(),
				mbox_sha1sum:$('#actor').find('.agent:first').find('.mbox_sha1sum').val(),
				openid:$('#actor').find('.agent:first').find('.openid').val(),
				account: {
					name:$('#actor').find('.agent:first').find('.accountHomePage').val(),
					homePage:$('#actor').find('.agent:first').find('.accountName').val()
				}
			});
			/*if ((myActor.account.name == "") && (myActor.account.homePage == ""))
			{
				delete myActor.account;
			}*/
			myActor.account = deleteEmptyProperties(myActor.account);
			myTinCan.actor = deleteEmptyProperties(myActor);
		break;
		case 'Group':
			var myActor = new TinCan.Group({
				name : $('#actor').find('.group:first').find('.name').val(),
				mbox : $('#actor').find('.group:first').find('.mbox').val(),
				mbox_sha1sum:$('#actor').find('.group:first').find('.mbox_sha1sum').val(),
				openid:$('#actor').find('.group:first').find('.openid').val(),
				account: {
					name:$('#actor').find('.group:first').find('.accountHomePage').val(),
					homePage:$('#actor').find('.group:first').find('.accountName').val()
				}
			});
			 $('#actor').find('.agent').each(function(index){
			 	var agentToAddToGroup = new TinCan.Agent({
				name : $(this).find('.name').val(),
				mbox : $(this).find('.mbox').val(),
				mbox_sha1sum: $(this).find('.mbox_sha1sum').val(),
				openid: $(this).find('.openid').val(),
				account: {
					name: $(this).find('.accountHomePage').val(),
					homePage: $(this).find('.accountName').val()
					}
				});

				myActor.member[index] = deleteEmptyProperties(agentToAddToGroup);
			 });
		break;
	}
	
	

	//verb
	var myVerbDisplay = new Object();
	$('#verb').find('.verbDisplay').each(function(index) {
	   myVerbDisplay[$(this).find('.verbDisplayKey').val()] = $(this).find('.verbDisplayValue').val()
	 });
	 myVerbDisplay = deleteEmptyProperties(myVerbDisplay);
	var myVerb = new TinCan.Verb({
		id : $('#verb').find('.verbId').val(),
		display : myVerbDisplay
	});
	 
	
	//TODO: ADD OTHER OBJECT TYPES
	//activity
	
	//Create the activity definition
	var myActivityDefinitionName = new Object();
	 $('#activity').find('.activityName').each(function(index) {
	   myActivityDefinitionName[$(this).find('.activityNameKey').val()] = $(this).find('.activityNameValue').val()
	 });
	 var myActivityDefinitionDescription = new Object();
	 $('#activity').find('.activityDescription').each(function(index) {
	   myActivityDefinitionDescription[$(this).find('.activityDescriptionKey').val()] = $(this).find('.activityDescriptionValue').val()
	 });
	 var myActivityDefinitionExtensions = new Object();
	  $('#activity').find('.activityExtension').each(function(index) {
	   myActivityDefinitionExtensions[$(this).find('.activityExtensionKey').val()] = $(this).find('.activityExtensionValue').val()
	 });
	 
	 var myActivityDefinition = new TinCan.ActivityDefinition({
		type : $('#activity').find('.activityType').val(),
		name:  deleteEmptyProperties(myActivityDefinitionName),
		description:  deleteEmptyProperties(myActivityDefinitionDescription),
		extensions:  deleteEmptyProperties(myActivityDefinitionExtensions)
	});
	
	myActivityDefinition = deleteEmptyProperties(myActivityDefinition);
	
	//Create the activity
	var myActivity = new TinCan.Activity({
		id : $('#activity').find('.activityId').val(),
		definition : myActivityDefinition
	});
	
	
	
	//create the statement
	var stmt = new TinCan.Statement({
		actor : deleteEmptyProperties(myActor),
		verb : deleteEmptyProperties(myVerb),
		target : deleteEmptyProperties(myActivity)
	},true);
	

	myTinCan.sendStatement(stmt, function() {});
}

