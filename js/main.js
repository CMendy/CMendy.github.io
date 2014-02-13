$(document).ready(function()
{
   var baseURL = "https://api.spark.io/v1/devices/";
   var timer1, timer2, timer3, timer4;
   var rawData = "0.0;0.0;0;0";
   var lastSample = new Date();

	loadGoogleLib();

 



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

 	parseData();

	getTemperatureData();

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
			var error = "";
			switch(dats[2])
			{
				case "1":
					error = "Open Connetion, is the thermocouple wire plugged in?";
					break;
				case "2":
					error = "Thermocouple is short-circuited to GND, is the bare wire touching somehting? ";
					break;
				case "3":
					error = "Thermocouple is short-circuited to VCC, is the bare wire touching somehting? ";
					break;
				case "4":
					error = "Serial Peripheral Interface Fault, cant comunicate with the thermocouple hardware!";
					break;
			}
			document.getElementById('temp-a-error').innerHTML = error;
			
			error = "";
			switch(dats[3])
			{
				case "1":
					error = "Open Connetion, is the thermocouple wire plugged in?";
					break;
				case "2":
					error = "Thermocouple is short-circuited to GND, is the bare wire touching somehting? ";
					break;
				case "3":
					error = "Thermocouple is short-circuited to VCC, is the bare wire touching somehting? ";
					break;
				case "4":
					error = "Serial Peripheral Interface Fault, cant comunicate with the thermocouple hardware!";
					break;
			}
			document.getElementById('temp-b-error').innerHTML = error;
			
		}
		
		 //$("#lbl-sample-date").innerHTML = "your text goes here"; 
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
   
   
   
   
   $("#post-1").on("click", function()
   {
      doMethod($("#method-1").val(), $("#data-1").val());
   });
   $("#post-2").on("click", function()
   {
      doMethod($("#method-2").val(), $("#data-2").val());
   });
   $("#post-3").on("click", function()
   {
      doMethod($("#method-3").val(), $("#data-3").val());
   });
   $("#post-4").on("click", function()
   {
      doMethod($("#method-4").val(), $("#data-4").val());
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

   // Variable on clicks
   $("#get-var-1").on("click", function()
   {
      getVariable1();
   });
   $("#get-var-2").on("click", function()
   {
      getVariable2();
   });
   $("#get-var-3").on("click", function()
   {
      getVariable3();
   });
   $("#get-var-4").on("click", function()
   {
      getVariable4();
   });

   // Get variable methods
   function getVariable1()
   {
      getVariable($("#var-1").val(), function(res)
      {
         $("#var-val-1").val(res.result);
      });
   }

   function getVariable2()
   {
      getVariable($("#var-2").val(), function(res)
      {
         $("#var-val-2").val(res.result);
      });
   }

   function getVariable3()
   {
      getVariable($("#var-3").val(), function(res)
      {
         $("#var-val-3").val(res.result);
      });
   }

   function getVariable4()
   {
      getVariable($("#var-4").val(), function(res)
      {
         $("#var-val-4").val(res.result);
      });
   }

   function loadGoogleLib()
   {
      var options = {packages: ['corechart'], callback : drawChart};
		google.load('visualization', '1', options);
   }

   function drawChart()
   {
      var data = google.visualization.arrayToDataTable([['Year', 'Sales', 'Expenses'], ['2004', 1000, 400], ['2005', 1170, 460], ['2006', 660, 1120], ['2007', 1030, 540]]);

      var options =
      {
         title : 'Company Performance'
      };

      var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
      chart.draw(data, options);
   }

   // Auto-refresh
   // Turn on/off the variable refresh if box is checked
   $("#refresh-1").on("change", function()
   {
      if ($("#refresh-1").is(":checked"))
      {
         var time = ($("#refresh-time-1").val() === '') ? 5000 : $("#refresh-time-1").val();
         $("#get-var-1").attr("disabled", "disabled");
         timer1 = setInterval(function()
         {
            getVariable1();
         }, time);
      }
      else
      {
         $("#get-var-1").removeAttr("disabled");
         if (timer1)
         {
            clearInterval(timer1);
         }
      }
   });
   $("#refresh-2").on("change", function()
   {
      if ($("#refresh-2").is(":checked"))
      {
         var time = ($("#refresh-time-2").val() === '') ? 5000 : $("#refresh-time-2").val();
         $("#get-var-2").attr("disabled", "disabled");
         timer2 = setInterval(function()
         {
            getVariable2();
         }, time);
      }
      else
      {
         $("#get-var-2").removeAttr("disabled");
         if (timer2)
         {
            clearInterval(timer2);
         }
      }
   });
   $("#refresh-3").on("change", function()
   {
      if ($("#refresh-3").is(":checked"))
      {
         var time = ($("#refresh-time-3").val() === '') ? 5000 : $("#refresh-time-3").val();
         $("#get-var-3").attr("disabled", "disabled");
         timer3 = setInterval(function()
         {
            getVariable3();
         }, time);
      }
      else
      {
         $("#get-var-3").removeAttr("disabled");
         if (timer3)
         {
            clearInterval(timer3);
         }
      }
   });
   $("#refresh-4").on("change", function()
   {
      if ($("#refresh-4").is(":checked"))
      {
         var time = ($("#refresh-time-4").val() === '') ? 5000 : $("#refresh-time-4").val();
         $("#get-var-4").attr("disabled", "disabled");
         timer4 = setInterval(function()
         {
            getVariable4();
         }, time);
      }
      else
      {
         $("#get-var-4").removeAttr("disabled");
         if (timer4)
         {
            clearInterval(timer4);
         }
      }
   });

});
