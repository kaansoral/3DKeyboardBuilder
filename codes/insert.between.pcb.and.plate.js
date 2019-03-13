var data=[
	["~\n`","!\n1","@\n2","#\n3","$\n4","%\n5","^\n6","&\n7","*\n8","(\n9",")\n0","_\n-","+\n=",{w:2},"Backspace"],
	[{w:1.5},"Tab","Q","W","E","R","T","Y","U","I","O","P","{\n[","}\n]",{w:1.5},"|\n\\"],
	[{w:1.75},"Caps Lock","A","S","D","F","G","H","J","K","L",":\n;","\"\n'",{w:2.25},"Enter"],
	[{w:2.25},"Shift","Z","X","C","V","B","N","M","<\n,",">\n.","?\n/",{w:1.75},"Shift",{a:7},""],
	[{a:4,w:1.25},"Ctrl",{w:1.25},"Win",{w:1.25},"Alt",{a:7,w:6.25},"",{a:4,w:1.25},"Alt",{w:1.25},"Win",{w:1.25},"Menu",{w:1.25},"Ctrl"]
];

var kerf=0.25;
var increase_height=0.5; // so switches touch the plate but not the PCB

function main() {
	var width=285;
	var height=95;
	var result=CSG.cube({
		center: [0, 0, 0],
		radius: [width/2,height/2,5/2]
	});
	var line=0;
	data.forEach(function(line_def){
		var w=1,dx=14,cx=0;
		line_def.forEach(function(current){
			if(is_object(current))
			{
				if(current.x) cx+=current.x*19;
				if(current.w) w=current.w;
			}
			else
			{
				var x=-(width/2-1)+cx+(w-1)*19/2+9;
				var y=-(height/2-1)+line*19+8.5;
				result=result.subtract(cherry_mx().translate([x,y,0]));
				if(w>=2 && w<5) result=result.subtract(costar(2).translate([x,y,0]));
				else if(w>=5) result=result.subtract(costar(6.25).translate([x,y,0]));
				cx+=dx+5+(w-1)*19;
				w=1;
				x=14;
			}
		});
		line++;
	});
	result=result.subtract(CSG.cube({ // remove a large piece representing the 1.5mm plate
		center: [0,0,-2],
		radius: [200,200,1.5]
	}));
	if(increase_height)
	{
		result=result.union(result.translate([0,0,increase_height])); // combines the plate with it's slightly moved upwards version, seems like the easiest way to increase the height
	}
	result=result.rotateX(180); // best to print this normally, since it won't be visible and the cutouts are easier to print at top
	result=result.setColor([0.8, 0.8, 0.8]);
	return result;
}

function costar(size)
{
	var xd=11.95; // 2u
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
		center: [xd, 1.3/2, 0],
		radius: [1.65+kerf,14.20/2+kerf,5/2]
	});
	result=result.union(CSG.cube({
		center: [xd, 1.3/2, 1],
		radius: [1.65+0.8+kerf,14.20/2+0.8+kerf,2]
	}));
	result=result.union(CSG.cube({
		center: [-xd, 1.3/2, 0],
		radius: [1.65+kerf,14.20/2+kerf,5/2]
	}));
	result=result.union(CSG.cube({
		center: [-xd, 1.3/2, 1],
		radius: [1.65+0.8+kerf,14.20/2+0.8+kerf,2]
	}));
	return result;
}

function cherry_mx()
{
	var result=CSG.cube({
		center: [0, 0, 0],
		radius: [7+kerf,7+kerf,5/2]
	});
	result=result.union(CSG.cube({
		center: [0, 7, 0],
		radius: [3.2+kerf,2,2/2]
	}));
	result=result.union(CSG.cube({
		center: [0,-7, 0],
		radius: [3.2+kerf,2,2/2]
	}));
	return result;
}

// Known bugs: If radius includes a 0, it causes the rendering to halt indefinitely [08/10/18]