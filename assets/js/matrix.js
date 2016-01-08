$(document).ready(function(){
	
	var w = $(window).innerWidth();
	var h = $(window).innerHeight();
		
	var $c = $('#canvas');

	function handle(item){
		var id = [item.type.toLowerCase(), item.equipmentnumber.toString()].join("-");
		
		if ($("#"+id).length) {

			// update element
			$("#"+id)
				.removeClass("animate")
				.attr("class", ["item", "animate", item.type.toLowerCase(), item.state.toLowerCase()].join(" "));

		} else {
			
			// determine station name
			item.station = (stations.hasOwnProperty(item.stationnumber.toString())) ? stations[item.stationnumber.toString()] : "Standort #"+item.stationnumber;

			// check description
			if (!item.description) item.description = "Aufzug";

			$('<div></div>')
			.attr("id", id)
				.addClass("item")
				.addClass(item.type.toLowerCase())
				.addClass(item.state.toLowerCase())
				.attr("title", [item.station, item.description].join(", "))
				.appendTo($c);
		}
		
	};

	// add all equipment
	$.getJSON("https://adam.noncd.db.de/api/v1.0/facilities", function(data){
		data = data.sort(function(a,b){
			return (a.equipmentnumber - b.equipmentnumber);
		});

		$.each(data, function(idx, item){
			handle(item);
		});
	});
	
	// open websocket
	var ws = new WebSocket("wss://liftstream.dsst.io/stream.ws");
	
	// keep websocket open by sending a packet every minute
	ws.onopen = function () {
		setInterval(function(){ ws.send('ping'); },60000);
	};
	
	ws.onmessage = function(msg){
		try {
			var data = JSON.parse(msg.data);
		} catch(e) { return; }
		handle(data);
	};
	
});