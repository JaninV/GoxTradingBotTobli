var bkgdPg = chrome.extension.getBackgroundPage();
var visibleChartSamples=bkgdPg.LogLines;

function refreshtable() {
	const backgroundColors = ["#f2f2ff", "#fffff0"];
	var lastBackgroundColorIndex=0;
	var lastDate="";
	var tab = document.getElementById("tab");
	document.getElementById("emal").innerHTML=bkgdPg.EmaLongPar;
	document.getElementById("emas").innerHTML=bkgdPg.EmaShortPar;

	if (bkgdPg.tradingIntervalMinutes>59)
		document.getElementById("int").innerHTML=parseInt(bkgdPg.tradingIntervalMinutes/60)+" hour"+(bkgdPg.tradingIntervalMinutes>119?"s":"")
	else
		document.getElementById("int").innerHTML=bkgdPg.tradingIntervalMinutes+" min";

	if (bkgdPg.tickCountBuy>1)
		document.getElementById("ticksBuy").innerHTML=bkgdPg.tickCountBuy+" samples"
	else
		document.getElementById("ticksBuy").innerHTML="1 sample";
		
	if (bkgdPg.tickCountSell>1)
		document.getElementById("ticksSell").innerHTML=bkgdPg.tickCountSell+" samples"
	else
		document.getElementById("ticksSell").innerHTML="1 sample";
		
	document.getElementById("buyTres").innerHTML=bkgdPg.MinBuyThreshold;
	document.getElementById("sellTres").innerHTML=bkgdPg.MinSellThreshold;
	
	if (bkgdPg.tradingEnabled==1) {
		document.getElementById("tradingEnabledStatus").style.display="block";
		document.getElementById("tradingDisabledStatus").style.display="none";
	} else {
		document.getElementById("tradingEnabledStatus").style.display="none";
		document.getElementById("tradingDisabledStatus").style.display="block";
	}
	
	var experimentalSettingsInfo="";
	if (bkgdPg.tradeOnlyAfterSwitch==1)
		experimentalSettingsInfo="<span class=\"experimentalSettingInfo\">Trade only after switch!</span>";
	if (bkgdPg.inverseEMA==1)
		experimentalSettingsInfo+="<span class=\"experimentalSettingInfo\">Inverse EMA enabled!</span>";
	document.getElementById("experimentalSettings").innerHTML=experimentalSettingsInfo;
		
	while (tab.rows.length>4)
		tab.deleteRow(4);

	var displayLines=Math.min(bkgdPg.H1.length,(bkgdPg.LogLines==0?bkgdPg.MaxSamplesToKeep-bkgdPg.preSamples:bkgdPg.LogLines));
	if ((bkgdPg.updateInProgress)&&(bkgdPg.H1.length<bkgdPg.MaxSamplesToKeep)) { // && bkgdPg.H1.length>bkgdPg.LogLines) {
		var r=tab.insertRow(4);
		var c=r.insertCell(-1);
		c.colSpan=5;
		c.innerHTML="&nbsp;<br>Fetching trading data - please wait...<br>("+bkgdPg.H1.length+" of "+bkgdPg.MaxSamplesToKeep+" samples loaded)<br>&nbsp;";
		c.style.backgroundColor="#FFFFFF";
		c.style.textAlign="center";
		c.id="loadCell";
	} else { // && bkgdPg.H1.length>bkgdPg.LogLines) {
		//for (var i=bkgdPg.H1.length-bkgdPg.LogLines; i<bkgdPg.H1.length; i++) {
		if (bkgdPg.emaLong==null || bkgdPg.emaLong.length<bkgdPg.H1.length || bkgdPg.emaShort==null || bkgdPg.emaShort.length<bkgdPg.H1.length) {
			bkgdPg.refreshEMA(true);
		}
		
		for (var i=bkgdPg.H1.length-displayLines; i<bkgdPg.H1.length; i++) {
			var el = bkgdPg.emaLong[i];
			var es = bkgdPg.emaShort[i];
			var perc = 100 * (es-el) / ((es+el)/2);
			var r=tab.insertRow(4);
			//var ti=new Date(bkgdPg.tim[i]*3600*1000)
			var d=new Date(bkgdPg.tim[i]*60*1000);
			r.title=bkgdPg.tobliGoxBot.getWeekdayName(d);
			//r.style.backgroundColor=backgroundColors[((bkgdPg.tim[i]+1)/24)&1]
			if (!(bkgdPg.tobliGoxBot.areSameLocalDate(d, lastDate))) {
				lastBackgroundColorIndex=1-lastBackgroundColorIndex;
				lastDate=d;
			}
			
			r.style.backgroundColor=backgroundColors[lastBackgroundColorIndex];

			//r.insertCell(-1).innerHTML=(new Date(bkgdPg.tim[i]*3600*1000)).getHours() + ":00"
			//r.insertCell(-1).innerHTML=bkgdPg.tobliGoxBot.formatTimeAndDate(d);
			
			r.insertCell(-1).innerHTML=bkgdPg.tobliGoxBot.FIXME_formatDayMonthAndTimeWithImplicitTodayDate(d);
			r.insertCell(-1).innerHTML=bkgdPg.H1[i].toFixed(3);
			r.insertCell(-1).innerHTML=es.toFixed(3);
			r.insertCell(-1).innerHTML=el.toFixed(3);
			var c=r.insertCell(-1);
			c.innerHTML=perc.toFixed(3)+'%';
			if (perc>bkgdPg.MinBuyThreshold || perc<-bkgdPg.MinSellThreshold) {
				c.style.backgroundColor = perc<0 ? "#ffd0d0" : "#d0ffd0";
			} else {
				c.style.backgroundColor = perc<0 ? "#fff0f0" : "#f0fff0";
			}
		}
	}

	if (isNaN(bkgdPg.fiat) || isNaN(bkgdPg.BTC)) {
		document.getElementById("nobalan").style.display="table-row";
		document.getElementById("balance").style.display="none";
	} else {
		document.getElementById("nobalan").style.display="none";
		document.getElementById("balance").style.display="table-row";
		document.getElementById("usd").innerHTML=bkgdPg.fiat.toFixed(2)+" "+ bkgdPg.currency;
		document.getElementById("btc").innerHTML=bkgdPg.BTC.toFixed(3);
	}
	
	var bitcoinchartsUrl;
	if (bkgdPg.tradingIntervalMinutes<10)
		bitcoinchartsUrl="http://www.bitcoincharts.com/charts/mtgoxUSD#rg1zig5-minztgSzbgBza1gEMAzm1g"+bkgdPg.EmaShortPar+"za2gEMAzm2g"+bkgdPg.EmaLongPar+"zi1gMACDzv";  // 1 day, 5-min, Candlestick , Bollinger Band, EMA(10), EMA(21), MACD
	else if (bkgdPg.tradingIntervalMinutes<30)
		bitcoinchartsUrl="http://www.bitcoincharts.com/charts/mtgoxUSD#rg1zig15-minztgSzbgBza1gEMAzm1g"+bkgdPg.EmaShortPar+"za2gEMAzm2g"+bkgdPg.EmaLongPar+"zi1gMACDzv"; // 1 day, 15-min
	else if (bkgdPg.tradingIntervalMinutes<60)
		bitcoinchartsUrl="http://www.bitcoincharts.com/charts/mtgoxUSD#rg2zig30-minztgSzbgBza1gEMAzm1g"+bkgdPg.EmaShortPar+"za2gEMAzm2g"+bkgdPg.EmaLongPar+"zi1gMACDzv"; // 2 days, 30-min
	else if (bkgdPg.tradingIntervalMinutes<120)
		bitcoinchartsUrl="http://www.bitcoincharts.com/charts/mtgoxUSD#rg5zigHourlyztgSzbgBza1gEMAzm1g"+bkgdPg.EmaShortPar+"za2gEMAzm2g"+bkgdPg.EmaLongPar+"zi1gMACDzv"; // 5 days, hourly
	else if (bkgdPg.tradingIntervalMinutes<=180)
		bitcoinchartsUrl="http://www.bitcoincharts.com/charts/mtgoxUSD#rg10zig2-hourztgSzbgBza1gEMAzm1g"+bkgdPg.EmaShortPar+"za2gEMAzm2g"+bkgdPg.EmaLongPar+"zi1gMACDzv"; // 10 days, 2-hours
	else
		bitcoinchartsUrl="http://www.bitcoincharts.com/charts/mtgoxUSD#rg30zig6-hourztgSzbgBza1gEMAzm1g"+bkgdPg.EmaShortPar+"za2gEMAzm2g"+bkgdPg.EmaLongPar+"zi1gMACDzv"; // month, 6-hours

	document.getElementById("externalChartLink").setAttribute('href',bitcoinchartsUrl);

	redrawChart();
}

function popupUpdateCounter() {
	var o=document.getElementById("loadCell");
	if (o) {
		o.innerHTML="&nbsp;<br>Fetching trading data - please wait...<br>("+bkgdPg.H1.length+" of "+bkgdPg.MaxSamplesToKeep+" samples loaded)<br>&nbsp;";
	}
	redrawChart();
}

function redrawChart() {
	if (localStorage.chartVisible==1) {
		document.getElementById("chart").style.display="block";
		document.getElementById("EMAChartHead").style.display="block";

		var chartWidth=285;
		var chartHeight=100;
		var switchesUp=[];
		var switchesDown=[];
		var latestSolidTrend=0;
		//var lastSwitch=0;
		
		//var visibleSamples=Math.min(bkgdPg.H1.length,(bkgdPg.LogLines==0?bkgdPg.MaxSamplesToKeep-bkgdPg.preSamples:bkgdPg.LogLines));
		var visibleSamples=Math.min(bkgdPg.H1.length,(visibleChartSamples==0?bkgdPg.MaxSamplesToKeep-bkgdPg.preSamples:visibleChartSamples));
		var visibleStartIndex=bkgdPg.H1.length-visibleSamples;
		var H1Visible=[];
		var emaShortVisible=[];
		var emaLongVisible=[];
		var timVisible=[];

		var visibleDays=0;
		var visibleHours=0;
		var visibleMinutes=(visibleSamples*bkgdPg.tradingIntervalMinutes);
		if (visibleMinutes>59) {
			visibleHours=Math.floor(visibleMinutes/60);
			visibleMinutes=visibleMinutes-visibleHours*60;
		}
		if (visibleHours>23) {
			visibleDays=Math.floor(visibleHours/24);
			visibleHours=visibleHours-visibleDays*24;
		}
		document.getElementById("chartTimeSpan").innerHTML=(visibleDays>0?visibleDays+" days ":"")+(visibleHours>0?visibleHours+ " hrs ":"")+(visibleMinutes>0?visibleMinutes+" min":"");

		// Calculate the chart scale (max/min of y-value) and find where the trend switches (for the first time in each direction)
		var chartMinY=bkgdPg.H1[visibleStartIndex];
		var chartMaxY=bkgdPg.H1[visibleStartIndex];
		for (var i=visibleStartIndex;i<bkgdPg.H1.length;i++) {
			H1Visible.push(bkgdPg.H1[i]);
			timVisible.push(bkgdPg.tim[i]);
			
			if (chartMinY>bkgdPg.H1[i])
				chartMinY=bkgdPg.H1[i];
			if (chartMaxY<bkgdPg.H1[i])
				chartMaxY=bkgdPg.H1[i];
			
			try {
				emaShortVisible.push(bkgdPg.emaShort[i]);
				emaLongVisible.push(bkgdPg.emaLong[i]);
				
				if (chartMinY>bkgdPg.emaShort[i])
					chartMinY=bkgdPg.emaShort[i];
				if (chartMaxY<bkgdPg.emaShort[i])
					chartMaxY=bkgdPg.emaShort[i];
	
				if (chartMinY>bkgdPg.emaLong[i])
					chartMinY=bkgdPg.emaLong[i];
				if (chartMaxY<bkgdPg.emaLong[i])
					chartMaxY=bkgdPg.emaLong[i];
			} catch (e) {
				// Exception - probably because the length of emaShort or emaLong is less that H1 - no big deal...
			}
		}
		
		for (var i=4;i<bkgdPg.H1.length-1;i++) {
			var trend=bkgdPg.getTrendAtIndex(i);
  		if ((latestSolidTrend!=3)&&(trend==3)) {
  			// Trend switch up!
  			switchesUp.push([i,Math.min(Math.min(bkgdPg.H1[i],bkgdPg.emaShort[i]),bkgdPg.emaLong[i])]);
  			latestSolidTrend=3;
  		} else if ((latestSolidTrend!=-3)&&(trend==-3)) {
    			// Trend switch down!
    		switchesDown.push([i,Math.max(Math.max(bkgdPg.H1[i],bkgdPg.emaShort[i]),bkgdPg.emaLong[i])]);
    		latestSolidTrend=-3;
  		}
		}

    // settings: http://omnipotent.net/jquery.sparkline/#s-docs
		var lineDrawn=false;
		if (emaShortVisible.length>=H1Visible.length) {
			$('#EMAChart').sparkline(emaShortVisible,{
				type: 'line',
				lineColor: '#008800',			
				fillColor: false,
				lineWidth: 1,
				composite: false,
	    	width: chartWidth+'px',
	    	height: chartHeight+'px',
		    minSpotColor: false,
		    maxSpotColor: false,
				spotColor: false,
				tooltipContainer: document.getElementById("chart"),
				tooltipClassname: 'chartTooltip',
				tooltipFormatter: formatEMAShortTooltip,
				highlightLineColor: '#CCC',
				highlightSpotColor: '#000',
				xvalues: timVisible,
		    chartRangeMin: chartMinY,
		    chartRangeMax: chartMaxY				
			});
			lineDrawn=true;
		}
		if (emaLongVisible.length>=H1Visible.length) {
			$('#EMAChart').sparkline(emaLongVisible,{
				type: 'line',
				lineColor: '#B00000',
				fillColor: false,
				lineWidth: 1,
				composite: (lineDrawn?true:false),
				width: chartWidth+'px',
				height: chartHeight+'px',
		    minSpotColor: false,
		    maxSpotColor: false,
				spotColor: false,
				tooltipContainer: document.getElementById("chart"),
				tooltipClassname: 'chartTooltip',
				tooltipFormatter: formatEMALongTooltip,
				highlightLineColor: '#CCC',
				highlightSpotColor: '#000',
				xvalues: timVisible,
		    chartRangeMin: chartMinY,
		    chartRangeMax: chartMaxY				
			});
			lineDrawn=true;
		}
    $('#EMAChart').sparkline(H1Visible,{
	    type: 'line',
	    lineColor: '#0000FF',
	    fillColor: false,
	    lineWidth: 1,
	    minSpotColor: false,
	    maxSpotColor: false,
	    spotColor: false,
	    composite: (lineDrawn?true:false),
	    width: chartWidth+'px',
	    height: chartHeight+'px',
	    tooltipContainer: document.getElementById("chart"),
	    tooltipClassname: 'chartTooltip',
	    tooltipFormatter: formatPriceTooltip,
	    highlightLineColor: '#CCC',
	    highlightSpotColor: '#000',
	    xvalues: timVisible,
	    chartRangeMin: chartMinY,
	    chartRangeMax: chartMaxY
		});

		
		// Draw trend switch arrows
		var indicatorCanvasOffset=4;
		var indicatorCanvas=document.getElementById("indicatorCanvas");		
		if (!indicatorCanvas) {
			indicatorCanvas=document.createElement('canvas');
			indicatorCanvas.id="indicatorCanvas";
			indicatorCanvas.setAttribute("width",chartWidth);
			indicatorCanvas.setAttribute("height",(chartHeight+2*indicatorCanvasOffset));
			indicatorCanvas.setAttribute("style","position:absolute;top:0px;left:0px;z-index:2000;pointer-events:none;margin:auto;margin-top:-4px;width:"+chartWidth+"px;height:"+(chartHeight+2*indicatorCanvasOffset+1)+"px;");
			document.getElementById("EMAChart").appendChild(indicatorCanvas);
		}
		var ctx =indicatorCanvas.getContext('2d');
		for (var i=0;i<switchesUp.length;i++) {
			var x=Math.round((switchesUp[i][0]-visibleStartIndex)/(visibleSamples-1)*(chartWidth-3)-3);
			var y=Math.min(chartHeight-Math.round((switchesUp[i][1]-chartMinY)/(chartMaxY-chartMinY)*chartHeight)+5+indicatorCanvasOffset,chartHeight+2*indicatorCanvasOffset-6);
			ctx.drawImage(upImg,x,y);
		}
		for (var i=0;i<switchesDown.length;i++) {
			var x=Math.round((switchesDown[i][0]-visibleStartIndex)/(visibleSamples-1)*(chartWidth-3)-3);
			var y=Math.max(chartHeight-Math.round((switchesDown[i][1]-chartMinY)/(chartMaxY-chartMinY)*chartHeight)-10-5+indicatorCanvasOffset,-5);
			ctx.drawImage(downImg,x,y);
		}
	} else {
		document.getElementById("chart").style.display="none";
		document.getElementById("EMAChartHead").style.display="none";
	}
}

function formatChartNumbers(v) {
	return v.toFixed(3);
}

var lastEmaTime=0;
var lastEmaShort=0;
var lastEMAShortTooltipLine="";
var lastEMALongTooltipLine="";
var lastTrendTooltipLine="";
var lastPriceTooltipLine="";

function formatEMAShortTooltip(sp, options, fields){
	lastEmaTime=fields.x;
	lastEmaShort=fields.y;
	lastEMAShortTooltipLine='<span style="color: '+fields.color+'">&#9679;</span> EMA'+bkgdPg.EmaShortPar+': '+formatChartNumbers(fields.y);
  return ""; // Don't draw until last curve's tooltip is calculated...
}

function formatEMALongTooltip(sp, options, fields){
    var trend='?';

    //
    // Display EMA S/L %. Helpful for gauging on the graph when trades execute on new trend directions.
    // Round to 3 decimal places.
    //
    var trendIndicator=((lastEmaShort-fields.y) / ((lastEmaShort+fields.y)/2)) * 100;

    if (lastEmaTime==fields.x) {
    	if (trendIndicator>0) {
    		trend='<img class="trendIndicatorImg" src="trend_'+(trendIndicator>bkgdPg.MinBuyThreshold?'strong':'weak')+'_up.gif">';
    	} else if (trendIndicator<0) {
    		trend='<img class="trendIndicatorImg" src="trend_'+(-trendIndicator>bkgdPg.MinSellThreshold?'strong':'weak')+'_down.gif">';
    	} else {
    		trend='none';
    	}  	
    }
    lastEMALongTooltipLine='<span style="color: '+fields.color+'">&#9679;</span> EMA'+bkgdPg.EmaLongPar+': '+formatChartNumbers(fields.y);
    lastTrendTooltipLine='Trend: '+trend+' '+formatChartNumbers(trendIndicator)+'%';
    return ""; // Don't draw until last curve's tooltip is calculated...
}

function formatPriceTooltip(sp, options, fields){
	lastPriceTooltipLine='<span style="color: '+fields.color+'">&#9679;</span> Price: '+formatChartNumbers(fields.y);
  return assembleTooltip(fields.x); // This is the last curve, so draw the final tooltip
}

function assembleTooltip(tim) {
	var d=new Date(tim*60*1000);
	var t=bkgdPg.tobliGoxBot.formatDateAndTimeWithLabeledTodayDate(d);
	var tooltip='<div align="center">'+t+
  						'<table width="100%" border="0"><tr><td align="center" class="tooltipTableCell">'+
  						lastPriceTooltipLine+'<br>'+
		  				lastEMAShortTooltipLine+'<br>'+
		  				lastEMALongTooltipLine+'<br>'+
		  				'</td></tr></table>'+
		  				lastTrendTooltipLine+'</div>';
  				
	lastEMAShortTooltipLine="";
	lastEMALongTooltipLine="";
	lastTrendTooltipLine="";
	lastPriceTooltipLine="";
	
  return tooltip;	
}

function toggleChart() {
	if ((localStorage.chartVisible===0)||(document.getElementById("chart").style.display=="none")) {
		localStorage.chartVisible=1;
	} else {
		localStorage.chartVisible=0;
	}
	redrawChart();
}

function zoomChart(zoomIn) {
	var maxVisibleSamples=bkgdPg.MaxSamplesToKeep-bkgdPg.preSamples;
	var visibleSamples=Math.min(bkgdPg.H1.length,(visibleChartSamples==0?maxVisibleSamples:visibleChartSamples));
	var maxMinutes=parseInt(maxVisibleSamples*bkgdPg.tradingIntervalMinutes);
	var visibleChartTimespan=visibleSamples*bkgdPg.tradingIntervalMinutes;
	
	var changeMinutes;
	if (visibleChartTimespan<(60*3))
		changeMinutes=30;
	else if (visibleChartTimespan<(60*12))
		changeMinutes=60;
	else if (visibleChartTimespan<(60*24))
		changeMinutes=60*3;
	else if (visibleChartTimespan<(60*3*24))
		changeMinutes=60*6;
	else if (visibleChartTimespan<(60*4*24))
		changeMinutes=60*12;
	else
		changeMinutes=60*24;
	
	if (zoomIn) {
		visibleChartTimespan=Math.max(30,visibleChartTimespan-changeMinutes);
	} else {
		visibleChartTimespan=Math.min(maxMinutes,visibleChartTimespan+changeMinutes);
	}
	visibleChartSamples=(visibleChartTimespan==maxMinutes?0:Math.max(10,parseInt(visibleChartTimespan/bkgdPg.tradingIntervalMinutes)));
	redrawChart();
}

var upImg = new Image();
var downImg = new Image();
upImg.onload = refreshtable;
downImg.onload = refreshtable;
upImg.src = 'trend_strong_up.gif';
downImg.src = 'trend_strong_down.gif';

refreshtable();
bkgdPg.popupRefresh=refreshtable;
bkgdPg.popupUpdateCounter=popupUpdateCounter;

document.addEventListener('DOMContentLoaded', function() {
	chartLink.addEventListener('click', function(){toggleChart()});
	enableTrading.addEventListener('click', function(){
		localStorage.tradingEnabled=bkgdPg.tradingEnabled=1;
		bkgdPg.chrome.browserAction.setIcon({path: 'robot_trading_on.png'});
		refreshtable();
	});
	disableTrading.addEventListener('click', function(){
		localStorage.tradingEnabled=bkgdPg.tradingEnabled=0;
		bkgdPg.chrome.browserAction.setIcon({path: 'robot_trading_off.png'});
		refreshtable();
	});
	zoomIn.addEventListener('click', function(e){
		zoomChart(true);
		return false;
	});
	zoomOut.addEventListener('click', function(e){
		zoomChart(false);
		return false;
	});
	
	visibleChartSamples=bkgdPg.LogLines;

	document.getElementById("EMAChart").addEventListener("mousewheel", function(e) {
		var delta = Math.max(-1,Math.min(1,(e.wheelDelta || -e.detail)));
		zoomChart(delta>0);
		return false;
	}, false);	
});
