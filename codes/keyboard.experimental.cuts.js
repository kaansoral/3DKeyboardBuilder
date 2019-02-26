var data=[
	[{c:"#1c1c1a",t:"#d9d9d9",a:6},"Esc",{c:"#525249",a:4,f:4},"!\n1","@\n2","#\n3","$\n4","%\n5","^\n6","&\n7","*\n8","(\n9",")\n0","_\n-","+\n=",{c:"#1c1c1a",a:7,f:3,w:2},"← Backspace"],
	[{a:4,w:1.5},"⇤\n⇥\n\n\n\n\nTab",{c:"#525249",f:5},"Q","W","E","R","T","Y","U","I","O","P",{f:4},"{\n[","}\n]",{w:1.5},"|\n\\"],
	[{c:"#1c1c1a",t:"#f7f7f7",a:5,f:3,w:1.25,w2:1.75,l:true},"\n■\n\n\n■",{x:0.5,c:"#525249",t:"#d9d9d9",a:4,f:5},"A","S","D",{n:true},"F","G","H",{n:true},"J","K","L",{f:4},":\n;","\"\n'",{c:"#1c1c1a",a:6,f:3,w:2.25},"⏎ Enter"],
	[{w:2.25},"⇧ Shift",{c:"#525249",a:4,f:5},"Z","X","C","V","B","N","M",{f:4},"<\n,",">\n.","?\n/",{x:0.375,c:"#ba2b70",f:6},"↑",{x:0.375,c:"#c9b50e",a:6,f:3},"Fn"],
	[{x:1,c:"#309ba1",w:1.25},"Alt",{x:0.25,c:"#8f8d8d",a:7,w:1.25},"",{c:"#525249",w:6.25},"",{c:"#8f8d8d",w:1.25},"",{x:0.3,c:"#ba2b70",a:4,f:6},"←",{x:0.075},"↓",{x:0.075},"→"]

];
// var data=[
// 	[{a:7},"","","",""],
// 	["",{w:2},"",""]
// ];

var kerf=0.05; // Tried 0.2 - extremely loose
var padding=12;
var min_x=9000,max_x=0,min_y=9000,max_y=0;
var feet=false;
var clean_cuts=[100,200],piece=1;
var switch_radius=7+kerf;

function main() {
	var cutouts=[];
	var line=0;
	data.forEach(function(line_def){
		var w=1,cx=0;
		line_def.forEach(function(current){
			if(is_object(current))
			{
				if(current.x) cx+=current.x*19;
				if(current.w) w=current.w;
			}
			else
			{
				var x=cx+(w-1)*19/2;
				var y=line*19;
				
				cutouts.push(cherry_mx().translate([x,y,0]));

				if(x-switch_radius<min_x) min_x=x-switch_radius;
				if(x+switch_radius>max_x) max_x=x+switch_radius;
				if(y-switch_radius<min_y) min_y=y-switch_radius;
				if(y+switch_radius>max_y) max_y=y+switch_radius;

				if(w>=2 && w<5) cutouts.push(costar(2).translate([x,y,0]));
				else if(w>=5) cutouts.push(costar(6.25).translate([x,y,0]));
				
				cx+=w*19; w=1;
			}
		});
		line++;
	});
	var x_length=max_x-min_x+2*padding;
	var y_length=max_y-min_y+2*padding;
	var result=CSG.cube({
		center: [x_length/2+min_x-padding,y_length/2+min_y-padding,0],
		radius: [x_length/2,y_length/2,5/2]
	});
	result=result.subtract(cutouts);
	result=result.translate([-(x_length/2+min_x-padding),-(y_length/2+min_y-padding),0]); // centers the plate at 0,0
	if(feet) // #TODO: Apply the new/fixed dimensions
	{
		[[min_x-7,min_y-7],[min_x-7,max_y+7],[max_x+7,min_y-7],[max_x+7,max_y+7]].forEach(function(xy){
			var x=xy[0],y=xy[1];
			result=result.union(CSG.cube({
				center: [x,y,7.5],
				radius: [5,5,10]
			}));

		});
		result=result.union(CSG.cube({
			center: [x_length/2-7-kerf,y_length/2-7-kerf,17],
			radius: [x_length/2+7+kerf+50,y_length/2+7+kerf+50,8]
		}).rotateX(-7));
	}
	if(clean_cuts)
	{
		var cut_length=1000;
		var zigzag_length=20;
		var cut_kerf=0.2;
		for(var cpiece=Math.max(0,piece-1);cpiece<Math.min(piece+1,clean_cuts.length);cpiece++) // either 1 or 2 cuts are made
		{
			var cut=clean_cuts[cpiece];
			var kerf_polarity=-1; // to the right
			var bottom_offset=0.5,top_offset=-0.5; // top zig-zag
			if(cpiece<piece) kerf_polarity=1;// to the left
			if(cpiece%2) bottom_offset=-0.5,top_offset=0.5; // bottom zig-zag
			result=result.subtract(CSG.cube({
				center: [(cut-x_length/2)-cut_length*kerf_polarity-zigzag_length*top_offset+cut_kerf*kerf_polarity,0,2.5],
				radius: [cut_length,cut_length,2.5]
			}));
			result=result.subtract(CSG.cube({
				center: [(cut-x_length/2)-cut_length*kerf_polarity-zigzag_length*bottom_offset+cut_kerf*kerf_polarity,0,-2.5],
				radius: [cut_length,cut_length,2.5]
			}));
		}
	}
	result=result.setColor([0,0.5,0.5]);
	return result;
}

function costar(size)
{
	var xd=11.95; // 2u
	var cutout_x=1; // extend the 3.5mm cutout 1mm in x direction
	var cutout_y=1.6;
	if(size==3) xd=19.05;
	else if(size==4) xd=28.575;
	else if(size==4.5) xd=34.671;
	else if(size==5.5) xd=42.8625;
	else if(size==6.25) xd=50;
	else if(size==6.5) xd=52.38;
	else if(size==7) xd=57.15;
	// -10.3 -13.6
	// -6.45 7.75
	var result=CSG.cube({
		center: [xd,1.3/2,0],
		radius: [1.65+kerf,14.20/2+kerf,2.5]
	});
	result=result.union(CSG.cube({
		center: [xd,1.3/2,1],
		radius: [1.65+cutout_x+kerf,14.20/2+cutout_y+kerf,2]
	}));
	result=result.union(CSG.cube({
		center: [-xd,1.3/2,0],
		radius: [1.65+kerf,14.20/2+kerf,2.5]
	}));
	result=result.union(CSG.cube({
		center: [-xd,1.3/2,1],
		radius: [1.65+cutout_x+kerf,14.20/2+cutout_y+kerf,2]
	}));
	return result;
}

function cherry_mx()
{
	var result=CSG.cube({
		center: [0,0,0],
		radius: [7+kerf,7+kerf,5/2]
	});
	result=result.union(CSG.cube({
		center: [0,7,0],
		radius: [3.2+kerf,2+kerf,1]
	}));
	result=result.union(CSG.cube({
		center: [0,-7,0],
		radius: [3.2+kerf,2+kerf,1]
	}));
	return result;
}

// Known bugs: If radius includes a 0, it causes the rendering to halt indefinitely [08/10/18]