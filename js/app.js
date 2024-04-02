// run with npx serve

import { ref } from 'vue'
export default {
	setup() {
		const queryString = window.location.search;
		const params = new URLSearchParams(queryString);
		console.log(params);
		const gridwidth = params.has('cols') ? parseInt(params.get('cols')) : 12;
		const gridheight = params.has('rows') ? parseInt(params.get('rows')) : 5;
		
		const start = '0,0';
		let end;
		if(gridwidth >= gridheight)
		{
			end = Math.floor(Math.random()*gridheight) + ',' + Math.floor(Math.random()*gridwidth/2 + gridwidth/2);
		}
		else
		{
			end = Math.floor(Math.random()*gridheight/2 + gridheight/2) + ',' + Math.floor(Math.random()*gridwidth);
		}
		const pathlength = Math.floor(Math.random()*(0.2*gridwidth*gridheight) + 0.4*gridwidth*gridheight);
		
		var path1 = [start];
		var path2 = [end];
		var curpathlength = 2;
		
		function getNextTile(coord)
		{
			const coords = coord.split(',');
			const row = parseInt(coords[0]);
			const col = parseInt(coords[1]);
			var tiles = [];
			
			const uptile = (row-1)+','+col;
			if(row > 0 && !path1.includes(uptile) && !path2.includes(uptile))
			{
				tiles.push(uptile);
			}
			
			const lefttile = row+','+(col-1);
			if(col > 0 && !path1.includes(lefttile) && !path2.includes(lefttile))
			{
				tiles.push(lefttile);
			}
			
			const righttile = row+','+(col+1);
			if(col < gridwidth - 1 && !path1.includes(righttile) && !path2.includes(righttile))
			{
				tiles.push(righttile);
			}
			
			const downtile = (row+1)+','+col;
			if(row < gridheight - 1 && !path1.includes(downtile) && !path2.includes(downtile))
			{
				tiles.push(downtile);
			}
			
			if(tiles.length > 0)
			{
				return tiles[Math.floor(Math.random()*tiles.length)];
			}
			else
			{
				return false;
			}
		}
		
		var first = true;
		let portalscheck = [];
		while(curpathlength < pathlength)
		{
			let checkcoord = '';
			let random = Math.random();
			if(Math.random() < 0.5 || first)
			{
				const lastTile1 = path1[path1.length-1];
				const tile1 = getNextTile(lastTile1);
				if(tile1 !== false)
				{
					path1.push(tile1);
				}
				else
				{
					while(true)
					{
						checkcoord = Math.floor(Math.random()*gridheight)+','+Math.floor(Math.random()*gridwidth);
						if(!path1.includes(checkcoord) && !path2.includes(checkcoord) && getNextTile(checkcoord) !== false)
						{
							if(!portalscheck.includes(path1[path1.length-1]))
							{
								portalscheck.push(path1[path1.length-1]);
								console.log("portal A " + path1[path1.length-1]);
							}
							path1.push(checkcoord);
							portalscheck.push(checkcoord);
							console.log("portal B " + checkcoord);
							break;
						}
					}
				}
				curpathlength += 1;
			}
			if(Math.random() >= 0.5 || first)
			{
				const lastTile2 = path2[path2.length-1];
				const tile2 = getNextTile(lastTile2);
				if(tile2 !== false)
				{
					path2.push(tile2);
				}
				else
				{
					while(true)
					{
						let checkcoord2 = Math.floor(Math.random()*gridheight)+','+Math.floor(Math.random()*gridwidth);
						let nextTile = getNextTile(checkcoord2);
						if(!path1.includes(checkcoord2) && !path2.includes(checkcoord2) && nextTile !== false && nextTile !== checkcoord)
						{
							if(!portalscheck.includes(path2[path2.length-1]))
							{
								portalscheck.push(path2[path2.length-1]);
								console.log("portal C " + path2[path2.length-1]);
							}
							path2.push(checkcoord2);
							portalscheck.push(checkcoord2);
							console.log("portal D " + checkcoord2);
							break;
						}
					}
				}
				curpathlength += 1;
			}
			if(first)
			{
				first = false;
			}
		}
		
		function getDir(coord1, coord2)
		{
			let coords1 = coord1.split(',');
			let coords2 = coord2.split(',');
			if(coords1[0] == coords2[0])
			{
				if(parseInt(coords1[1]) == parseInt(coords2[1])+1)
				{
					return 'left';
				}
				else if(parseInt(coords1[1]) == parseInt(coords2[1])-1)
				{
					return 'right';
				}
			}
			else if(coords1[1] == coords2[1])
			{
				if(parseInt(coords1[0]) == parseInt(coords2[0])+1)
				{
					return 'up';
				}
				else if(parseInt(coords1[0]) == parseInt(coords2[0])-1)
				{
					return 'down';
				}
			}
			return 'portal';
		}
		
		let path1end = path1[path1.length-1].split(',');
		let path2end = path2[path2.length-1].split(',');
		portalscheck.push(path1end.join(','));
		portalscheck.push(path2end.join(','));
		
		const fullpath = path1.concat(path2.toReversed());
		console.log(fullpath);
		
		console.log(portalscheck);
		for(let i = 0; i < portalscheck.length; i++)
		{
			let index = fullpath.indexOf(portalscheck[i]);
			if(portalscheck.includes(fullpath[index+1]) && portalscheck.includes(fullpath[index-1]))
			{
				console.log("removing " + fullpath[index]);
				fullpath.splice(index, 1);
			}
		}
		
		var grid = ref([]);
		const dirs = ['down', 'left', 'up', 'right'];
		let portalnum = 0;
		let portals = {};
		let removetiles = [];
		for(let i = 0; i < gridheight; i++)
		{
			let row = [];
			for(let j = 0; j < gridwidth; j++)
			{
				let type = '', movable = 0, rotation = 0, extra = '';
				let coord = i+','+j;
				let pathIndex = fullpath.indexOf(coord);
				if(pathIndex !== -1)
				{
					if(start == coord)
					{
						type = 'S';
						let nextCoord = fullpath[pathIndex+1];
						rotation = dirs.indexOf(getDir(coord, nextCoord));
						extra = 'A';
					}
					else if(end == coord)
					{
						type = 'E';
						let prevCoord = fullpath[pathIndex-1];
						rotation = dirs.indexOf(getDir(coord, prevCoord));
						extra = 'A';
					}
					else
					{
						let prevCoord = fullpath[pathIndex-1];
						let nextCoord = fullpath[pathIndex+1];
						let prevDir = getDir(coord, prevCoord);
						let nextDir = getDir(coord, nextCoord);
						if(nextDir == 'portal')
						{
							type = 'P';
							if(Object.keys(portals).includes(coord))
							{
								extra = portals[coord];
							}
							else
							{
								portals[coord] = portalnum;
								portals[nextCoord] = portalnum;
								extra = portalnum++;
							}
							rotation = dirs.indexOf(getDir(coord, prevCoord));
						}
						else if(prevDir == 'portal')
						{
							type = 'P';
							if(Object.keys(portals).includes(coord))
							{
								extra = portals[coord];
							}
							else
							{
								portals[coord] = portalnum;
								portals[prevCoord] = portalnum;
								extra = portalnum++;
							}
							rotation = dirs.indexOf(getDir(coord, nextCoord));
						}
						else if(Math.abs(dirs.indexOf(nextDir) - dirs.indexOf(prevDir)) == 2)
						{
							type = 'I';
							if(dirs.indexOf(nextDir) % 2 == 0)
							{
								rotation = 0;
							}
							else
							{
								rotation = 1;
							}
						}
						else
						{
							type = 'L';
							rotation = (Math.max(dirs.indexOf(nextDir), dirs.indexOf(prevDir)) + 1)%4;
							if(rotation == 0 && Math.min(dirs.indexOf(nextDir), dirs.indexOf(prevDir)) == 0)
							{
								rotation = 1;
							}
						}
					}
					let movableunlikely = ['P'].includes(type);
					if((movableunlikely && Math.random() < 0.25) || (!movableunlikely && Math.random() < 0.8))
					{
						movable = 1;
						if(type == 'I')
						{
							if(Math.random() < 0.75)
							{
								rotation = (rotation + 1) % 4;
							}
						}
						else
						{
							if(Math.random() < 0.9)
							{
								rotation = (rotation + Math.floor(Math.random()*3)+1)%4;
							}
						}
					}
					else
					{
						movable = 0;
					}
				}
				else
				{
					let random = Math.random();
					if(random < 0.3)
					{
						type = 'D';
					}
					else if(random < 0.65)
					{
						type = 'I';
					}
					else
					{
						type = 'L';
					}
					rotation = Math.floor(Math.random()*4);
					if(Math.random() < 0.7 && type !== 'D')
					{
						movable = 1;
					}
					else
					{
						movable = 0;
					}
				}
				
				let cell = [type, rotation, movable, extra];
				row.push(cell);
			}
			grid.value.push(row);
		}
		
		console.log(grid.value);
		
		// [type, rotation, movable, start colour/portal index]
		//var paths = {'C':[], 'M':[], 'Y':[]};
		//const colours = {'C': 'cyan', 'M': 'magenta', 'Y': 'yellow'};
		var paths = {'A':[]};
		//const colouroptions = ['#ff0088', '#ff1e00', '#ff8400', '#ffae00', '#fff200', '#a2ff00', '#00ff99', '#00f7ff', '#00e1ff', '#c800ff', '#f200ff'];
		//const colouroptions = ['#ff8ca7', '#ff8c8c', '#ffb08c', '#ffb88c', '#fff98c', '#baff8c', '#8cffea', '#8cf5ff', '#8ccbff', '#cb8cff', '#f98cff'];
		const colouroptions = ['#fc6fa3', '#fcb86f', '#fcf76f', '#aafc6f', '#6ff5fc', '#cd8cff'];
		const colours = {'A': colouroptions[Math.floor(Math.random()*colouroptions.length)]};
		
		//const shapes = ref(['⬤','■','▲','◆','★','+','⬟','▼']);
		//const shapes = ref(['α','β','γ','δ','ε','ζ','η','θ']);
		let shapes = [];
		for(let i = 0; i < portalnum+1; i++)
		{
			shapes.push(i+1);
		}
		//const shapes = ref([1,2,3,4,5,6,7,8]);
		for(let i = 0; i < grid.value.length; i++)
		{
			for(let j = 0; j < grid.value[i].length; j++)
			{
				if(['P','E'].includes(grid.value[i][j][0]))
				{
					grid.value[i][j].splice(3, 0, '');
				}
				else if(grid.value[i][j][0] == 'S')
				{
					paths[grid.value[i][j][3]] = [i+','+j];
				}
				if(grid.value[i][j].length < 4)
				{
					grid.value[i][j].push('');
				}
			}
		}
		
		function tileCode(params)
		{
			if(params.length == 0)
			{
				return '<div></div>';
			}
			else
			{
				var rotatedegrees = params[1]*90;
				var movableclass = params[2] == 0 ? "tile-immovable" : "tile-movable";
				var tilediv = '<div class="tile ' + movableclass + '" style="rotate: ' + rotatedegrees + 'deg">';
				if(params[0] == 'I')
				{
					tilediv += '<div class="i-node"></div>';
				}
				else if(params[0] == 'L')
				{
					tilediv += '<div class="lv-node"></div><div class="lh-node"></div>';
				}
				tilediv += '<div class="circle-node"></div></div>';
			}
			return tilediv;
		}
		
		function getNodeClass(type, alt=false)
		{
			if(type == "X")
			{
				return "empty-node";
			}
			else if(type == "I")
			{
				return "i-node";
			}
			else if(type == "L")
			{
				if(alt)
				{
					return "lh-node";
				}
				return "lv-node";
			}
			else if(type == "S")
			{
				return "start-node";
			}
			else if(type == "E")
			{
				return "end-node";
			}
			else if(type == "P")
			{
				return "portal-node";
			}
			else if(type == "D")
			{
				return "deadend-node";
			}
		}
		function getMovableClass(a)
		{
			if(a == 0)
			{
				return "tile-immovable";
			}
			else
			{
				return "tile-movable";
			}
		}
		function getColour(tile, rowIndex, colIndex)
		{
			if(tile[0] === 'S')
			{
				return colours[tile[3]];
			}
			else
			{
				const dirs = ['up', 'right', 'down', 'left'];
				let openings = [];
				if(tile[0] == 'I')
				{
					openings = [dirs[tile[1]], dirs[(tile[1]+2)%4]];
				}
				else if(tile[0] == 'L')
				{
					openings = [dirs[tile[1]], dirs[(tile[1]+1)%4]];
				}
				else if(tile[0] == 'E')
				{
					openings = [dirs[(tile[1]+2)%4]];
				}
				else if(tile[0] == 'P')
				{
					openings = [dirs[(tile[1]+2)%4]];
					for(let i = 0; i < grid.value.length; i++)
					{
						for(let j = 0; j < grid.value[i].length; j++)
						{
							let adjTile = grid.value[i][j];
							if(adjTile[0] == 'P' && adjTile[4] == tile[4] && adjTile[3] !== '')
							{
								let adjTileIndex = paths[adjTile[3]].indexOf(i+','+j);
								let tileIndex = paths[adjTile[3]].indexOf(rowIndex+','+colIndex);
								if(adjTileIndex !== -1 && (tileIndex === -1 || tileIndex > adjTileIndex))
								{
									let colour = adjTile[3];
									let coord = rowIndex+','+colIndex;
									if(paths[colour].indexOf(coord) === -1)
									{
										paths[colour].push(coord);
									}
									grid.value[rowIndex][colIndex][3] = colour;
									return colours[colour];
								}
							}
						}
					}
				}
				if(rowIndex > 0 && openings.includes('up'))
				{
					let upTile = grid.value[rowIndex-1][colIndex];
					if(upTile[3] !== '')
					{
						let adjTileIndex = paths[upTile[3]].indexOf((rowIndex-1)+','+colIndex);
						let tileIndex = paths[upTile[3]].indexOf(rowIndex+','+colIndex);
						
						if(adjTileIndex !== -1 && (tileIndex === -1 || tileIndex > adjTileIndex) && ((upTile[0] == 'I' && upTile[1]%2 == 0) || (upTile[0] == 'L' && [1,2].includes(upTile[1])) || (upTile[0] == 'S' && upTile[1] == 0) || (upTile[0] == 'P' && upTile[1] == 0)))
						{
							let colour = upTile[3];
							let coord = rowIndex+','+colIndex;
							if(paths[colour].indexOf(coord) === -1)
							{
								paths[colour].push(coord);
							}
							grid.value[rowIndex][colIndex][3] = colour;
							return colours[colour];
						}
					}
				}
				if(colIndex > 0 && openings.includes('left'))
				{
					let leftTile = grid.value[rowIndex][colIndex-1];
					if(leftTile[3] !== '')
					{
						let adjTileIndex = paths[leftTile[3]].indexOf((rowIndex+','+(colIndex-1)));
						let tileIndex = paths[leftTile[3]].indexOf(rowIndex+','+colIndex);
						
						if(adjTileIndex !== -1 && (tileIndex === -1 || tileIndex > adjTileIndex) && ((leftTile[0] == 'I' && leftTile[1]%2 == 1) || (leftTile[0] == 'L' && [0,1].includes(leftTile[1])) || (leftTile[0] == 'S' && leftTile[1] == 3) || (leftTile[0] == 'P' && leftTile[1] == 3)))
						{
							let colour = leftTile[3];
							let coord = rowIndex+','+colIndex;
							if(paths[colour].indexOf(coord) == -1)
							{
								paths[colour].push(coord);
							}
							grid.value[rowIndex][colIndex][3] = colour;
							return colours[colour];
						}
					}
				}
				if(colIndex < grid.value[rowIndex].length-1 && openings.includes('right'))
				{
					let rightTile = grid.value[rowIndex][colIndex+1];
					if(rightTile[3] !== '')
					{
						let adjTileIndex = paths[rightTile[3]].indexOf(rowIndex+','+(colIndex+1));
						let tileIndex = paths[rightTile[3]].indexOf(rowIndex+','+colIndex);
						
						if(adjTileIndex !== -1 && (tileIndex === -1 || tileIndex > adjTileIndex) && ((rightTile[0] == 'I' && rightTile[1]%2 == 1) || (rightTile[0] == 'L' && [2,3].includes(rightTile[1])) || (rightTile[0] == 'S' && rightTile[1] == 1) || (rightTile[0] == 'P' && rightTile[1] == 1)))
						{
							let colour = rightTile[3];
							let coord = rowIndex+','+colIndex;
							if(paths[colour].indexOf(coord) == -1)
							{
								paths[colour].push(coord);
							}
							grid.value[rowIndex][colIndex][3] = colour;
							return colours[colour];
						}
					}
				}
				if(rowIndex < grid.value.length-1 && openings.includes('down'))
				{
					let downTile = grid.value[rowIndex+1][colIndex];
					if(downTile[3] !== '')
					{
						let adjTileIndex = paths[downTile[3]].indexOf((rowIndex+1)+','+colIndex);
						let tileIndex = paths[downTile[3]].indexOf(rowIndex+','+colIndex);
						
						if(adjTileIndex !== -1 && (tileIndex === -1 || tileIndex > adjTileIndex) && ((downTile[0] == 'I' && downTile[1]%2 == 0) || (downTile[0] == 'L' && [0,3].includes(downTile[1])) || (downTile[0] == 'S' && downTile[1] == 2) || (downTile[0] == 'P' && downTile[1] == 2)))
						{
							let colour = downTile[3];
							let coord = rowIndex+','+colIndex;
							if(paths[colour].indexOf(coord) === -1)
							{
								paths[colour].push(coord);
							}
							grid.value[rowIndex][colIndex][3] = colour;
							return colours[colour];
						}
					}
				}
				if(grid.value[rowIndex][colIndex][3] !== '')
				{
					let colour = grid.value[rowIndex][colIndex][3];
					let index = paths[grid.value[rowIndex][colIndex][3]].indexOf(rowIndex+','+colIndex);
					console.log(rowIndex+','+colIndex + ' ' + index);
					if(index !== -1)
					{
						let removed = paths[colour].splice(index);
						for(let i = 0; i < removed.length; i++)
						{
							let coords = removed[i].split(',');
							if(grid.value[coords[0]][coords[1]][3] == colour)
							{
								grid.value[coords[0]][coords[1]][3] = '';
							}
						}
					}
				}
				grid.value[rowIndex][colIndex][3] = '';
			}
			return colours[tile[3]];
		}
		function rotate(tile, rowIndex, colIndex)
		{
			if(tile[2])
			{
				grid.value[rowIndex][colIndex][1] = (grid.value[rowIndex][colIndex][1] + 1)%4;
			}
		}
		function checkWinStatus()
		{
			let winCondition = true;
			for(let i = 0; i < grid.value.length; i++)
			{
				for(let j = 0; j < grid.value[i].length; j++)
				{
					if(grid.value[i][j][0] == 'E')
					{
						if(grid.value[i][j][3] !== grid.value[i][j][4])
						{
							winCondition = false;
						}
					}
				}
			}
			//console.log(winCondition);
			return winCondition;
		}
		
		// ⬤■▲◆★+⬟▼  ♣♦♠♥
		
		return { grid, tileCode, getNodeClass, getMovableClass, shapes, getColour, rotate, colours, checkWinStatus };
	},
	template: `<div>
		<h2 :style="'visibility: ' + (checkWinStatus() ? 'visible' : 'hidden') + ';'">You solved the puzzle!</h2>
		<div v-for="(row, rowIndex) in grid">
			<div style="display: inline-block" v-for="(tile, colIndex) in row">
				<div :class="'tile ' + getMovableClass(tile[2])" :style="'rotate: '+tile[1]*90+'deg;'" v-if="tile.length != 0" @click="rotate(tile, rowIndex, colIndex)">
					<div :style="'background-color: '+getColour(tile, rowIndex, colIndex)+';'" :class="getNodeClass(tile[0])"></div>
					<div v-if="tile[0] == 'L'" :style="'background-color: '+getColour(tile, rowIndex, colIndex)+';'" :class="getNodeClass(tile[0],true)"></div>
					<div v-if="tile[0] != 'X'" :class="(tile[0] === 'P' ? 'bigcircle-node' : 'circle-node')" :style="'background-color: '+(tile[0] == 'E' ? colours[tile[4]] : getColour(tile, rowIndex, colIndex))+'; rotate: '+tile[1]*(-90)+'deg;'"></div>
					<div v-if="tile[0] == 'P'" :class="'portalsymbol' + (getColour(tile, rowIndex, colIndex) !== '' ? ' active' : '')" :style="'rotate: '+tile[1]*(-90)+'deg;'">
						{{shapes[tile[4]]}}
					</div>
				</div>
			</div>
			<br />
		</div>
		<br />
	</div>`
}
// :style="'rotate: '+(tile[0] === 'P' ? 0 : tile[1]*90)+'deg;'"
// https://www.telerik.com/blogs/passing-variables-to-css-on-a-vue-component