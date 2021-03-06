var COMList=[];
var butCOMList=[];
var COMLog;
var butCloseCOM;
var COMGetDevicesID;
var openedCOMID;
var x="";
/*COMRxCB
*/
var COMRxCB=function(b)
{
	var data="";
	new Uint8Array(b.data).forEach(function(i){data+=String.fromCharCode(i);});
	//console.log("received :"+data);
	COMLog.value+=data;
	data="";
}

/*butCloseCOMcb
*/
var butCloseCOMcb=function(){
	console.log("button CLOSE pressed");
	//enable every button
	butCOMList.forEach(function(i){
		$('#'+i+'').attr('disabled',false);		
	});
	
	//close open COM
	if(openedCOMID){
		chrome.serial.disconnect(openedCOMID,function(res){
			chrome.serial.onReceive.removeListener(COMRxCB);
			//console.log(res)
		});
		openedCOMID=false;
	}
	
	//remove COMLog and CLOSE button
	$('#COMLog').remove();
	COMLog=false;
	$("#butCloseCOM").remove();
	butCloseCOM=false;
	
	//restart the polling on COM ports
	COMGetDevicesID=setInterval(function(){chrome.serial.getDevices(onGetDevices);},2000);
}


/*butCOMcb
*/
var butCOMcb=function(a){
	//stop polling active COMs
	if(COMGetDevicesID){
		clearInterval(COMGetDevicesID);
		COMGetDevicesID=false
	}
	
	//debug info
	//console.log("Button "+a.getAttribute("value")+" pressed");
	
	//creating COM log window, if not existing
	if($('#COMLog').length){
		//clear COMLog content
		COMLog.value="";
	}
	else{
		//create COMLog
		COMLog=document.createElement('textarea');
		COMLog.setAttribute('id',"COMLog");
		COMLog.setAttribute('rows',"10");
		COMLog.setAttribute('cols',"50");
		COMLog.setAttribute('onclick',butCloseCOMcb);
		COMLog.value='binded to '+a.getAttribute("value");
		$('#endOfTextArea').append(COMLog);
		
		//create a button to close the COM port
		butCloseCOM=document.createElement('input');
		butCloseCOM.setAttribute('type',"button");
		butCloseCOM.setAttribute('id',"butCloseCOM");
		butCloseCOM.setAttribute('value',"Close");
		$("#endOfTextArea").before(butCloseCOM);
		$("#butCloseCOM").click(butCloseCOMcb);
	}
	
	//disabling other buttons
	butCOMList.forEach(function(i){
		if(i!=a.getAttribute("id")){
			$('#'+i+'').attr('disabled',true);	
		}			
	});
	
	//time to open COM port 
	chrome.serial.connect(a.getAttribute("value"),{bitrate:115200},function(info){
		openedCOMID=info.connectionId;
		console.log("id :"+info.connectionId);
		chrome.serial.onReceive.addListener(COMRxCB);
	});
}

/*onGetDevices
  callback that takes a COM list and convert it to a number of clickable buttons
*/
var onGetDevices=function(ports){
	//remove old buttons, if any
	for(var i in COMList)
		$('#butCOM_'+i).remove();
	//empty old lists
	COMList=[];
	butCOMList=[];
	//retrieve each COM name
	for(var i=0;i<ports.length;i++)
		COMList[i]=(ports[i].path);
	COMList.sort();
	//create a button for each COM
	for (var i in COMList){
		butCOMList[i]="butCOM_"+i;
		$("#endOfTextArea").before($("<input type=\"button\" id=\""+butCOMList[i]+"\" value=\""+COMList[i]+"\"/>"));
		$('#butCOM_'+i).click(function(){butCOMcb(this);});		
	}		
}



chrome.serial.getDevices(onGetDevices);
COMGetDevicesID=setInterval(function(){chrome.serial.getDevices(onGetDevices);},2000);