$(document).ready(function()
{

   var baseURL = "https://api.spark.io/v1/devices/";
   var sampleTimer;
   var rawData = "0.0;0.0;0;0";
   var rawDataPrevious = "0.0;0.0;0;0";
   var lastSample = new Date();
	//var chartData = [['Time', 'Temp A', 'Temp B']];
	var dataTable = null;
	var lastTempA = 0;
	var lastTempB = 0;

	var googleOptions = {packages: ['corechart'], callback : BuildGoogleTable};
	google.load('visualization', '1', googleOptions);
		
	function BuildGoogleTable()
	{
		dataTable = new google.visualization.DataTable();
		// dataTable.addColumn('datetime', 'Time'); // Implicit domain label col.
		// dataTable.addColumn('number', 'Temp A'); // Implicit series 1 data col.
		// dataTable.addColumn('number', 'Temp B'); // Implicit series 1 data col.
	
		dataTable.addColumn('datetime', 'Time'); // Implicit domain label col.
		dataTable.addColumn('number', 'Temp A'); // Implicit series 1 data col.
		dataTable.addColumn({type:'string', role:'annotation'}); // annotation role col.
		dataTable.addColumn({type:'string', role:'annotationText'}); // annotationText col.
		dataTable.addColumn('number', 'Temp B'); // Implicit series 1 data col.
		dataTable.addColumn({type:'string', role:'annotation'}); // annotation role col.
		dataTable.addColumn({type:'string', role:'annotationText'}); // annotationText col.
		drawChart();
	}



   // Check if core id and token is in local storage
   if (localStorage.getItem("api-token"))
   {
      $("#api-token").val(localStorage.getItem("api-token"));
   }
   else
   {
   	localStorage.setItem("api-token","93499e15f3b3a36952c283bdf77c161977a626da");
   	$("#api-token").val(localStorage.getItem("api-token"));
   }
   
   if (localStorage.getItem("core-id"))
   {
      $("#core-id").val(localStorage.getItem("core-id"));
   }
   else
   {
   	localStorage.setItem("core-id", "50ff71065067545644320387");
   	$("#core-id").val(localStorage.getItem("core-id"));
   }

  //Change settings header if we don't have info
   checkSettings();
   
   // Save core id and token values to local storage whenever they're changed
   $("#api-token").on("change", function()
   {
      localStorage.setItem("api-token", $("#api-token").val());
      checkSettings();
   });
   $("#core-id").on("change", function()
   {
      localStorage.setItem("core-id", $("#core-id").val());
      checkSettings();
   });

   // Check the state of the settings
   function checkSettings()
   {
      var apiToken = localStorage.getItem("api-token");
      var coreID = localStorage.getItem("core-id");
      if (apiToken === undefined || apiToken === '' || apiToken === null || coreID === undefined || coreID === '' || coreID === null)
      {
         $("#settings-panel").removeClass("panel-default").addClass("panel-danger");
         return false;
      }
      else
      {
         $("#settings-panel").removeClass("panel-danger").addClass("panel-default");
         return true;
      }
   }


	/////
	// My temperature data stuff
	/////

 	//parseData();

	//getTemperatureData();

	sampleTimer = setInterval(function()
	{
	   getTemperatureData();
	}, 1000);
	
	function parseData()
	{
		document.getElementById('lbl-sample-date').innerHTML = "Last Sample: " + lastSample.toLocaleTimeString();
		var dats = rawData.split(";");
		
		if(dats.length >= 4)
		{
			document.getElementById('temp-a').innerHTML = dats[0] + " C";
			document.getElementById('temp-b').innerHTML = dats[1] + " C";
			
			// define SPI_FAULT 4
			// define SCV_FAULT 3
			// define SCG_FAULT 2
			// define OC_FAULT 1
			var errorA = null;
			var annotA = null;
			switch(dats[2])
			{
				case "1":
					errorA = "Open Connetion, is the thermocouple wire plugged in?";
					annotA = "E";
					break;
				case "2":
					errorA = "Thermocouple is short-circuited to GND, is the bare wire touching somehting? ";
					annotA = "E";
					break;
				case "3":
					errorA = "Thermocouple is short-circuited to VCC, is the bare wire touching somehting? ";
					annotA = "E";
					break;
				case "4":
					errorA = "Serial Peripheral Interface Fault, cant comunicate with the thermocouple hardware!";
					annotA = "E";
					break;
				case "5":
					errorA = "Could not comunicate with Spark device, is it on and connected to the internet?";
					annotA = "E";
					break;
			}
			document.getElementById('temp-a-error').innerHTML = errorA;
			
			var errorB = null;
			var annotB = null;
			switch(dats[3])
			{
				case "1":
					errorB = "Open Connetion, is the thermocouple wire plugged in?";
					annotB = "B";
					break;
				case "2":
					errorB = "Thermocouple is short-circuited to GND, is the bare wire touching somehting? ";
					annotB = "B";
					break;
				case "3":
					errorB = "Thermocouple is short-circuited to VCC, is the bare wi;re touching somehting? ";
					annotB = "B";
					break;
				case "4":
					errorB = "Serial Peripheral Interface Fault, cant comunicate with the thermocouple hardware!";
					annotB = "B";
					break;
				case "5":
					errorA = "Could not comunicate with Spark device, is it on and connected to the internet?";
					annotA = "E";
					break;
			}
			document.getElementById('temp-b-error').innerHTML = errorB;
			
			if(rawDataPrevious != rawData)
			{
				//chartData.push([new Date(), parseFloat(dats[0]), parseFloat(dats[1]) ]);
				rawDataPrevious = rawData;
				if(dataTable !== null)
				{
					if(isDifferent( parseFloat(dats[0]),  parseFloat(dats[1])) || annotA != null || annotB != null)
					{
						dataTable.addRow([new Date(), parseFloat(dats[0]), annotA, errorA, parseFloat(dats[1]), annotB, errorB]);
						document.getElementById('lbl-debug-data').innerHTML = dataTable.getNumberOfRows() + " Samples.";
						drawChart();
					}
				}
				else
				{
					document.getElementById('lbl-debug-data').innerHTML ="0 Samples.";
				}
			}
		}
		
		
		 //$("#lbl-sample-date").innerHTML = "your text goes here"; 
	}
	
	function isDifferent(tmpa, tmpb)
	{
		if(tmpa > lastTempA + 0.25 || tmpa < lastTempA - 0.25 )
		{
			lastTempA = tmpa;
			lastTempB = tmpb;
			return true;	
		}
		
		if(tmpb > lastTempB + 0.25 || tmpb < lastTempB - 0.25 )
		{
			lastTempA = tmpa;
			lastTempB = tmpb;
			return true;	
		}
		
		return false;
	}


	function getTemperatureData()
	{
		var url = baseURL + $("#core-id").val() + "/data?access_token=" + $("#api-token").val();
      $.getJSON(url, function(res)
      {
         rawData = res.result;
         lastSample = new Date();
         parseData();
         }
         ).fail(function(obj)
      {
      	onGetDataFailure();
      	rawData = "0.0;0.0;5;5";
         lastSample = new Date();
         parseData();
      });    
	}

   ////
   // Alerts
   ////
   $("#info-alert").alert();
   $("#info-alert").affix();

   ////
   // Methods
   ////
   // On method success
   function onMethodSuccess()
   {
      alert = $("#info-alert");
      alert.text("Success!").removeClass("alert-danger").addClass("alert-success");
      alert.show();
      setTimeout(function()
      {
         alert.hide();
      }, 2000);
   }

   function onMethodFailure()
   {
      alert = $("#info-alert");
      alert.text("Ruh roh!").removeClass("alert-success").addClass("alert-danger");
      alert.show();
      // setTimeout(function()
      // {
         // alert.hide();
      // }, 2000);
   }

	function onGetDataFailure()
   {
      alert = $("#info-alert");
      alert.text("Ruh roh! Could not retrive temperature data.").removeClass("alert-success").addClass("alert-danger");
      alert.show();
      // setTimeout(function()
      // {
         // alert.hide();
      // }, 2000);
   }


   // The base level run method command
   function doMethod(method, data)
   {
      var url = baseURL + $("#core-id").val() + "/" + method;
      $.ajax(
      {
         type : "POST",
         url : url,
         data :
         {
            access_token : $("#api-token").val(),
            args : data
         },
         success : onMethodSuccess,
         dataType : "json"
      }).fail(function(obj)
      {
         onMethodFailure();
      });
   }

   // Post methods
   $("#post-test").on("click", function()
   {
      getTemperatureData();
   });
   

   ////
   // Variables
   ////
   // Generic get method
   function getVariable(variable, callback)
   {
      var url = baseURL + $("#core-id").val() + "/" + variable + "?access_token=" + $("#api-token").val();
      $.getJSON(url, callback).fail(function(obj)
      {
         onMethodFailure();
      });
   }

   function drawChart()
   {
   	if(dataTable !== null)
   	{
	      //var data = google.visualization.arrayToDataTable([['Time', 'TempA', 'TempB'], ['1', 21, 21.5], ['2', 23, 21.5],['3', 30, 21],['4', 50, 21],['5', 70, 21.5],['6', 72, 21.5],['7', 73, 21.5],['8', 74, 20],['9', 21, 21.5]]);
			//var data = google.visualization.arrayToDataTable(chartData);
	      var options =
	      {
	         title : 'Temperature  Graph',
	         //curveType: 'function',
	    		legend: { position: 'bottom' }
	      };
	
	      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
	      chart.draw(dataTable, options);
     	}
   }

  

});
