var urlJSON = 'https://api.myjson.com/bins/';
var idsParticipants = [
	'mi7s4',
	'1hiwec',
	'10x4c4',
	'ew2yc',
	't6hh0',
	'jpoyc',
	'kwk5w',
	'9lbo4',
	'gqixg',
	'z6yok'
];

var idsDraw = [
	'jez5g',
	'83qno',
	'19m1ro',
	'sch84',
	'sxwtw',
	'6dl04',
	'1cncyc',
	'1du85w',
	'1f13dg',
	'ghyac'
]


var participants = [];
var draw = [];

function getParticipants(){
	idsParticipants.forEach(id => {
		axios.get(`${urlJSON}/${id}`)
			.then(response => {
				const participant = response.data;
				participant.idJSON = id;
				participants.push(participant);
			})
			.catch(error => {
				console.log(error);
			})
	})
}

function getDraw(){
	idsDraw.forEach(id => {
		axios.get(`${urlJSON}/${id}`)
			.then(response => {
				const item = response.data;
				item.idJSON = id;
				draw.push(item);
			})
			.catch(error => {
				console.log(error);
			})
	})
}

async function login() {
	const name = document.getElementById("name").value;
	const password = document.getElementById("password").value;
	const user = participants.find(participant => participant.name === name);
	if(user){
		if (password !== '') {
			if(user.password === ''){
				//Update user password
				user.password = password;
				await axios.put(`${urlJSON}/${user.idJSON}`, user);
				localStorage.setItem("id", user.id);
				localStorage.setItem("name", user.name);
				const drawn = await drawFriend(user.id);
				const {name} = getDrawn(drawn.idDrawn);
				localStorage.setItem("drawn", name);
				window.location.href = "home.html";
			}else{
				if(user.password === password){
					drawFriend(user.id);
					localStorage.setItem("id", user.id);
					localStorage.setItem("name", user.name);
					const drawn = await drawFriend(user.id);
					const {name} = getDrawn(drawn.idDrawn);
					localStorage.setItem("drawn", name);
					window.location.href = "home.html";
				}else{
					alert('Senha incorreta!')
				}
			}
		}else{
			alert('Informe uma senha!')
		}
	}else{
		alert('Usuário não encontrado!');
	}
}

async function isLogged(){
	if(!localStorage.getItem("id")){
		logout();
	}else{
		const welcome = document.getElementById('welcome');
		welcome.appendChild(document.createTextNode('Bem-vindo(a), ' + localStorage.getItem("name") + '!'));
		const message = document.getElementById('message');
		message.appendChild(document.createTextNode('Seu amigo oculto é: ' + localStorage.getItem("drawn")))
	}
}

function logout(){
	localStorage.clear();
	window.location.href = "index.html";
}

async function drawFriend(id){
	const drawn = isInDraw(id);

	if(drawn.idDrawn == ""){
		//Remove participant
		const candidates =  filterCandidates(id);
		//Draw participant
		const randomDrawn = randomParticipant(candidates);

		await axios.put(`${urlJSON}/${drawn.idJSON}`,
			{
				idParticipant: id,
				idDrawn : randomDrawn.id
			}
		);
		const participant = getDrawn(randomDrawn.id);
		participant.drawn = true;
		await axios.put(`${urlJSON}/${participant.idJSON}`, participant);

		draw.forEach(item => {
			if(item.idParticipant == id) item.idDrawn = randomDrawn.id;
		});

	}

	return drawn;
}

function isInDraw(id){
	return draw.find(item => item.idParticipant == id);
}

function getDrawn(id){
		return participants.find(participant => participant.id == id);
}

function randomParticipant(candidates) {
    let min = Math.ceil(0);
    let max = Math.floor(candidates.length -1);
    let index = Math.floor(Math.random() * (max - min + 1)) + min;
    return candidates[index];
}

function filterCandidates(id){
	return participants.filter(person => {
		return person.id != id && !person.drawn
	});
}

function showReport(){
	const report = document.getElementById('report');
	const ul = document.createElement('ul');
	draw.forEach(item => {
		const li = document.createElement('li');
		const {name} = participants.find(participant => participant.id == item.idParticipant);
		const status = (item.idDrawn !== "") ? "acessou" : "não acessou";
		li.appendChild(document.createTextNode(name + ' ' + status));
		ul.appendChild(li);
	})
	report.appendChild(ul);
}

getParticipants();
getDraw();
