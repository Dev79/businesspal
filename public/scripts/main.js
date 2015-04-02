var authCode = null;
		//The name of the application registered on https://developer.citrixonline.com/
		var appName = "BusinessPalMeet";
		//The client Id of that application. Currently to be found under "Consumer Key" in your Application management screen.
		var clientId = "MmzU0kcMQEAaeQsqFX7bYuNOGy7nG2tQ"; //6gztFFT7TLvDecQLGmYjdBZt5Kijfu22 
		//Global variable to persist the access token.
		var accessToken = null;

		/*
		* Get all the DOM elements we will be manipulating.
		* We will also load the respective buttons with functions to make the desired calls to the API.
		*/
		window.onload = function() {
			msgBox = document.getElementById("messageBox");
			

			//Get meeting form elements
			inputSubject = document.getElementById("subject");
			inputStartDate = document.getElementById("startDate");
			inputEndDate = document.getElementById("endDate");
			inputStartTime = document.getElementById("startTime");
			inputEndTime = document.getElementById("endTime");
			inputIsPasswordRequired = document.getElementById("passwordReq");
			inputConferenceCallInfo = document.getElementById("conferenceCallInfo");
			inputMeetingType = document.getElementById("meetingType");
			inputMeetingId = document.getElementById("meetingid");
			
			createCodeBtn = document.getElementById("createCodeBTN");
			createCodeBtn.addEventListener("click", function()
				{
					//build the URL for API Authorization
					var urlAuth ="https://api.citrixonline.com/oauth/authorize?access_type=G2M&app_name=" + appName
						+ "&client_id=" + clientId;
					window.open(urlAuth, "_self", "Citrix", false);
				}, false);

			authCodeBtn = document.getElementById("getCodeBTN");
			authCodeBtn.addEventListener("click", function(){getAuthCode()}, false);

			accessTokenBtn = document.getElementById("createTokenBTN");
			accessTokenBtn.addEventListener("click", function(){createAccessToken()}, false);

			if (getUrlParam("code") == "" ) 
			{
				authCodeBtn.disabled = true;
				accessTokenBtn.disabled = true;
			}
			else 
			{
				accessTokenBtn.disabled = true;
				createCodeBtn.disabled = true;
				authCodeBtn.disabled = false;
				authCodeBtn.title = "";
			}
			/*
			* Makes a call to the API to create a meeting. The input entered into the form on the html page is sent to the server.
			* The previously generated access token is used to authorize the application.
			*/
			createMeetingBtn = document.getElementById("createMeetingBTN");
			createMeetingBtn.addEventListener("click", function() 
				{
					setMeetingData();
					var url = "https://api.citrixonline.com/G2M/rest/meetings";
					HTTPRequest(url, "POST", meetingData);
				}, false);
			createMeetingBtn.disabled = true;
	
			/*
			* Makes a call to the API to get a meeting specified by the meeting id entered into the input field.
			* The previously generated access token is used to authorize the application.
			*/
			getMeetingBtn = document.getElementById("getMeetingBTN");
			getMeetingBtn.addEventListener("click", function() 
				{
					var url = "https://api.citrixonline.com/G2M/rest/meetings/" + inputMeetingId.value.toString();
					HTTPRequest(url, "GET", meetingData);
				}, false);
			getMeetingBtn.disabled = true;

			/*
			* Makes a call to the API to delete a meeting specified by the meeting id entered into the input field.
			* The previously generated access token is used to authorize the application.
			* Similar to the Get Meeting call, but instead of the GET request method we use DELETE.
			*/
			deleteMeetingBtn = document.getElementById("deleteMeetingBTN");
			deleteMeetingBtn.addEventListener("click", function() 
				{
					var url = "https://api.citrixonline.com/G2M/rest/meetings/" + inputMeetingId.value.toString();
					HTTPRequest(url, "DELETE", meetingData);
					msgBox.innerHTML = "Meeting deleted!";
				}, false);
			deleteMeetingBtn.disabled = true;

			//Add listeners to validate the input forms.
			inputCreateMeeting = document.getElementById("createMeeting");
			inputCreateMeeting.addEventListener("change", function() 
				{
					createMeetingBtn.disabled = validateForm('createMeeting');
				}, false)
			inputGetMeeting = document.getElementById("meetingid");
			inputGetMeeting.addEventListener("keyup", function() 
				{
					getMeetingBtn.disabled = document.getElementById("meetingid").value === '';
					deleteMeetingBtn.disabled = getMeetingBtn.disabled;
				}, false)
		}

		/*-------------------------------------------------------------------------------*/
		/*------------------------------OAuth Authorization------------------------------*/
		/*-------------------------------------------------------------------------------*/
		//Fetches the authorization code from the URL after the user logged in to G2M and gave consent to the application.
		function getAuthCode() {
			var code = getUrlParam("code");
			//update DOM
			if (code != "" ) {
				msgBox.innerHTML="This is your authorization code: " +  code;
				accessTokenBtn.disabled = false;
				accessTokenBtn.title = "";
				authCodeBtn.disabled = true;
				authCodeBtn.title = "";
			}
			else {
				msgBox.innerHTML="No code available!";
			}
			authCode = code;
			return code;
		}
		
		/* 
		* Makes a call to the API to retrieve the access token using the received authorization code.
		* For clarity we will not be using the generig HTTPRequest method used for other API requests.
		* 
		* You should persist the generated token for later use in your application.
		*/
		function createAccessToken()
		{
			try
			{
				var url = "https://api.citrixonline.com/oauth/access_token?grant_type=authorization_code&code=" + authCode
							+ "&client_id=" + clientId;
				var xmlhttp =  new XMLHttpRequest();
				xmlhttp.open("GET",url,false);
				xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				
				xmlhttp.send();
				console.info("Result:(" + xmlhttp.status + ")",xmlhttp.responseXML);
				switch( xmlhttp.status )
				{
					case 200:
						var data=JSON.parse(xmlhttp.responseText); 
						accessToken = data.access_token;
						msgBox.innerHTML = "This is the generated access token: &#10;" + accessToken + "&#10; Full response: &#10;" + JSON.stringify(data, null, '\t');
						console.log(data);
						console.info("Success!");
						break;
					default:
						console.info("createAccessToken unexpected result: " + xmlhttp.status);
						break;
				}
			} 
			catch(err)
			{
				console.info("Error on createAccessToken: ", err);
			}
		}
		/*-------------------------------------------------------------------------------*/
		/*-------------------------------------------------------------------------------*/
	

		//Empty meeting data object containting the required information for a Create Meeting post request
		var meetingData = 
		{
				//A string with less than 100 characters.
				"subject":"Example", 
				//iso8601 UTC strings
				"starttime":"2014-12-01T09:00:00", 
				"endtime":"2014-12-01T10:00:00", 
				//Whether the meeting is password restricted or not. The password cannot be set via API, so "false" is recommended.
				"passwordrequired":"false", 
				//Has to be set to either PSTN, Free, Hybrid, Private or VoIP.
				"conferencecallinfo":"",
				//Deprecated. Has to be provided and set to an empty string.
				"timezonekey":"",
				//Has to be set to Immediate, Scheduled or Recurring
				"meetingtype":""
			};
		

		//Transfers the form input data into the meetingData object, applying the correct format.
		function setMeetingData()
		{
			meetingData["subject"] = inputSubject.value;
			meetingData["starttime"] = inputStartDate.value + "T" + inputStartTime.value + ":00";
			meetingData["endtime"] = inputEndDate.value + "T" + inputEndTime.value + ":00";
			meetingData["passwordrequired"] = inputIsPasswordRequired.checked.toString();
			meetingData["conferencecallinfo"] = inputConferenceCallInfo.options[inputConferenceCallInfo.selectedIndex].value;
			meetingData["meetingtype"] = inputMeetingType.options[inputMeetingType.selectedIndex].value;
			
			console.log(meetingData);
		}

		/* 
		* Generic function to make requests to the API.

		* @param serviceUrl defines the url of the respective calls you want to make to the API.
		* @param httpRequestMethod defines the web request method, e.g. "GET", "POST", etc.
		* @param content optional, JSON object which contains information that should be send to the server.
		*/
		function HTTPRequest(serviceUrl, httpRequestMethod, content) 
		{
			try 
			{
				var postData = "";
				var xmlhttp = new XMLHttpRequest();
				xmlhttp.open(httpRequestMethod,serviceUrl,false);
				xmlhttp.setRequestHeader("Accept", "application/json");
				xmlhttp.setRequestHeader("Content-type", "application/json");
				xmlhttp.setRequestHeader("Authorization", "OAuth oauth_token=" + accessToken);
				if(typeof content !== undefined) 
				{
					postData = JSON.stringify(content);
				}
				console.info("Request(" + httpRequestMethod + "): " + serviceUrl);
				xmlhttp.send(postData);
				console.info("Result:("+ xmlhttp.status + ")", xmlhttp.responseText);

				//HTTP response code treatment, incomplete
				switch(xmlhttp.status) {
					case 200:
						result = JSON.parse(xmlhttp.responseText);
						console.log(result[0]);
						msgBox.innerHTML = "Meeting information: &#10;" + JSON.stringify(result[0], null, '\t');						
						break;
					case 201:
						result = JSON.parse(xmlhttp.responseText);
						console.log(result[0]);
						msgBox.innerHTML = "You successfully created a Meeting! This is your join URL: &#10;" + result[0]["joinURL"] + "&#10;and the meeting id: &#10;" + result[0]["meetingid"];						
						break;
					case 204:
						result = JSON.parse(xmlhttp.responseText);
						console.log(result[0]);
						msgBox.innerHTML = "Meeting deleted: &#10;" + JSON.stringify(result[0], null, '\t');						
						break;
					case 403:
						console.info("Token invalid");
						break;		
					default:
						console.info("Error: ",xmlhttp.responseText)
						result = JSON.parse(xmlhttp.responseText);
						break;
				}	
			}
			catch (err)
			{
	 			console.info("Error: ",err);
			}
		}

		/*-------------------------------------------------------------------------------*/
		/*---------------------------Simple helper functions-----------------------------*/
		/*-------------------------------------------------------------------------------*/
		//Simple function to read URL paramters
		function getUrlParam(name) 
		{
			name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
			var regexS = "[\\?&]"+name+"=([^&#]*)";
			var regex = new RegExp( regexS );
			var results = regex.exec( window.location.href );

			if ( results == null )
				return "";
			else
				return results[1];
		}

		//A rudimentary form validation script. For proper imlementation you should extend it.
		function validateForm(fieldsetName) 
		{
			var fieldset = document.getElementById(fieldsetName);
			var fields= fieldset.getElementsByTagName("input");
			for (var fieldi= fields.length; fieldi-->0;) {
        		if (fields[fieldi].value == '') return true;
    		}
    		return false;
		}