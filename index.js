
document.addEventListener("DOMContentLoaded", function(){
    
})


// TODO:

/*



Graphic 
Need to have access to max and min weight 


Need to remove graphic when going from graphic to raw and/or table 

*/
class AppController {
	
	static displayWelcome() {
        
		const wrapper = document.getElementsByClassName('wrapper')[0]
		
		const showTable = document.createElement('button')
		showTable.id = 'showTable'
		showTable.innerText = 'View Table'
		
		const showGraphic = document.createElement('button')
		showGraphic.id = 'showGraphic'
		showGraphic.innerText = "Show Graphic"
		
		const showRaw = document.createElement('button')
		showRaw.id = 'showRaw'
		showRaw.innerText = 'Show Raw' 
		
		wrapper.appendChild(showTable)
		wrapper.appendChild(showGraphic)
		wrapper.appendChild(showRaw)
		
        
		const weight = document.getElementById('raw').innerText
		const result = Weight.parseLog(weight)

		showTable.addEventListener('click', e => AppController.displayTable(result))		
		showGraphic.addEventListener('click', e => AppController.displayGraphic(result))
        showRaw.addEventListener('click', e => AppController.displayRaw())
        
    }	
	
	static displayTable(object) {
		const wrapper = document.getElementsByClassName('wrapper')[0]
		
		const p = document.getElementsByTagName('p')
		if (!!p[0]) {
			p[0].hidden = true 
		}
		
		const g = document.getElementsByClassName('graphContainer')[0]
		if (!!g) {
			g.remove()
		}
				
		const table = document.createElement('table')
		let row = table.insertRow(0)
		let cell1 = row.insertCell(0)
		let cell2 = row.insertCell(1)
		let cell3 = row.insertCell(2)
		
		cell1.innerText = "Date"
		cell2.innerText = "Weight (lb)"
		cell3.innerText = "Body Fat %"
		
		const keys = Object.keys(object.weight)
		
		for (let i = 0; i < keys.length; i++) {
			let rowNumber = i + 1; 
			let row = table.insertRow(rowNumber)
			let cell1 = row.insertCell(0)
			let cell2 = row.insertCell(1)
			let cell3 = row.insertCell(2)
			
			cell1.innerText = DateFormat.mmddyy(keys[i])
			cell2.innerText = object.weight[keys[i]]
			if (!!object.bodyfat[keys[i]]) {
				cell3.innerText = object.bodyfat[keys[i]]
			} else {
				cell3.innerText = " - "
			}
		}
		
		wrapper.appendChild(table)
	}
	
	static displayGraphic(object) {		
		const body = document.getElementsByTagName('body')[0]
		
		const p = document.getElementById('raw')
		if (!!p) {
			p.hidden = true 
		}
		
		const t = document.getElementsByTagName('table')
		if (!!t[0]) {
			t[0].remove()
		}
		
		const graphContainer = document.createElement('div')
		graphContainer.id = 'graphContainer'
		graphContainer.classList.add('graphContainer')
		
		body.appendChild(graphContainer)
		
		const keys = Object.keys(object.weight)	 // how many bars 	
		let width = window.innerWidth 
		let height = window.innerHeight 
		//const bars = Math.floor(width / keys.length) // px width of each bar 		

		const weightRange = object.maxWeight - object.minWeight; 
		const interval = width / weightRange // how many pxs per lb 
		

		for (let i = 0; i < (keys.length / 2 ); i++) {
			let barHeight =  (object.weight[keys[i]] - object.minWeight) * interval  
			let bar = document.createElement('div')
			//bar.setAttribute("style",("width:"+bars.toString()+" px; height:"+Math.floor(barHeight.toString())+" px;"));
			bar.setAttribute("style",("width:"+Math.floor(barHeight.toString())+" px; height:10 px;"));
			bar.classList.add('bar')
			graphContainer.appendChild(bar)
		}
	}
	
	static displayRaw() {
		const wrapper = document.getElementsByClassName('wrapper')[0]
		
		const g = document.getElementsByClassName('graphContainer')[0]
		if (!!g) {
			g.remove()
		}
		
		const p = document.getElementById('raw')
		if (!!p) {
			p.hidden = false  
		}
		
		const t = document.getElementsByTagName('table')
		if (!!t[0]) {
			t[0].remove()
		}
	}

    static loadFile() {

        const fileToLoad = document.getElementById("fileToLoad").files[0];
        const fileReader = new FileReader();

        let text 
        
        fileReader.onload = function(fileLoadedEvent){
            text = fileLoadedEvent.target.result; 
            const p = document.getElementById('raw')
            if (!!p) {
                p.hidden = false  
                p.innerText=text;
            }           
            AppController.displayWelcome()
        };
        fileReader.onabort = x => console.log("abort")
        fileReader.onerror = x => console.log("error")
        
        fileReader.readAsText(fileToLoad, "UTF-8")
    }
}

class Weight {
	static parseLog(text) {
		//text is a very long string of all weight entries 
		let array = text.split(" ")
		//array consists of strings that are either dates, body fat %, or weights in lbs
		let obj = {} // key = date in yymmdd format, value = weight in lbs 
		let bodyfat = {} //key = date in yymmdd format, value = weight in lbs 
		let currentDate = "" 
		let max = 0
		let min = 99999
		
		const maxMinTest = (test) => {			
			let intTest = parseInt(test, 10)
			
			if (intTest < min) {
				min = intTest;
			}
			if (intTest > max) {
				max = intTest;
			}
		}			
		
		// iterate through the array and add elements to the obj 
		array.forEach((line) => {
			
			// if there is a / then this a date, create new object key 
			if (line.includes('/')) {
				let date = DateFormat.yymmdd(line)
				obj[date] = ""
				currentDate = date 
			}
			// if there is a % then it is a body fat entry 
			else if (line.includes('%')) {
				bodyfat[currentDate] = line;
			}
			// all other entrys are weights as long as it's not a line break 
			else if (!line.includes('-')) {
				obj[currentDate] = line
				// if this is max or min value overwrite current max / min 
				maxMinTest(line);
			}
		})
		
		return {weight: obj, bodyfat: bodyfat, maxWeight: max, minWeight: min}
	}
}

class DateFormat {
	// change date from mm/dd/yy to yymmdd 
	static yymmdd(string) {
		let mmddyy = string.split('/')
		for (let i = 0 ; i < mmddyy.length; i++ ) {
			if (mmddyy[i].length < 2) {
				mmddyy[i] = '0' + mmddyy[i]
			}
		}		
		return [mmddyy[2], mmddyy[0], mmddyy[1]].join("") 
	}
	
	// change date from yymmdd to mm/dd/yy
	static mmddyy(string) {
		const a = string.split("")
		return (a[2]+a[3]+"/"+a[4]+a[5]+"/"+a[0]+a[1])
	} 
} 

