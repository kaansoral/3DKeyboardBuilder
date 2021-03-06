var data=[
	[{c:"#1c1c1a",t:"#d9d9d9",a:6},"Esc",{c:"#525249",a:4,f:4},"!\n1","@\n2","#\n3","$\n4","%\n5","^\n6","&\n7","*\n8","(\n9",")\n0","_\n-","+\n=",{c:"#1c1c1a",a:7,f:3,w:2},"← Backspace"],
	[{a:4,w:1.5},"⇤\n⇥\n\n\n\n\nTab",{c:"#525249",f:5},"Q","W","E","R","T","Y","U","I","O","P",{f:4},"{\n[","}\n]",{w:1.5},"|\n\\"],
	[{c:"#1c1c1a",t:"#f7f7f7",a:5,f:3,w:1.25,w2:1.75,l:true},"\n■\n\n\n■",{x:0.5,c:"#525249",t:"#d9d9d9",a:4,f:5},"A","S","D",{n:true},"F","G","H",{n:true},"J","K","L",{f:4},":\n;","\"\n'",{c:"#1c1c1a",a:6,f:3,w:2.25},"⏎ Enter"],
	[{w:2.25},"⇧ Shift",{c:"#525249",a:4,f:5},"Z","X","C","V","B","N","M",{f:4},"<\n,",">\n.","?\n/",{x:0.375,c:"#ba2b70",f:6},"↑",{x:0.375,c:"#c9b50e",a:6,f:3},"Fn"],
	[{x:1,c:"#309ba1",w:1.25},"Alt",{x:0.25,c:"#8f8d8d",a:7,w:1.25},"",{c:"#525249",w:6.25},"",{c:"#8f8d8d",w:1.25},"",{x:0.3,c:"#ba2b70",a:4,f:6},"←",{x:0.075},"↓",{x:0.075},"→"]

];

var kerf=0.1;

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
		radius: [3.2+kerf,2+kerf,2/2]
	}));
	result=result.union(CSG.cube({
		center: [0,-7, 0],
		radius: [3.2+kerf,2+kerf,2/2]
	}));
	return result;
}

// Known bugs: If radius includes a 0, it causes the rendering to halt indefinitely [08/10/18]