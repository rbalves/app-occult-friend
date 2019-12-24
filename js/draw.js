var participants = [];
var draw = [];

function getUrl(){
	const url = 'https://api.myjson.com/bins';
	return url;
}

function getUrisParticipants(){
	return [
		`mi7s4`,
		`1hiwec`,
		`10x4c4`,
		`ew2yc`,
		`t6hh0`,
		`jpoyc`,
		`kwk5w`,
		`9lbo4`,
		`gqixg`,
		`z6yok`
	];
}

function getUrisDraw(){
	return [
		`jez5g`,
		`83qno`,
		`19m1ro`,
		`sch84`,
		`sxwtw`,
		`6dl04`,
		`1cncyc`,
		`1du85w`,
		`1f13dg`,
		`ghyac`
	];
}

async function getPromises(uris){
	const url = getUrl();
	const promises = [];
	uris.forEach(uri => {
		promises.push(axios.get(`${url}/${uri}`));
	});
	await Promise.all(promises);
	return promises;
}

async function getParticipants(){
	const uris = getUrisParticipants();
	const promises = await getPromises(uris);
	promises.forEach(promise => {
		promise.then((response) => {
			participants.push(response.data);
		})
	});
}

async function getDraw(){
	const uris = getUrisDraw();
	const promises = await getPromises(uris);
	promises.forEach(promise => {
		promise.then((response) => {
			draw.push(response.data);
		})
	});
}

async function goToHome(user){
	const drawn = await drawFriend(user.id);
	const {name} = getParticipantById(drawn.idDrawn);
	localStorage.setItem("name", user.name);
	localStorage.setItem("drawn", name);
	window.location.href = "home.html";
}

async function savePassword(user){
	const url = getUrl();
	await axios.put(`${url}/${user.idJSON}`, user);
}

async function login() {
	const name = document.getElementById("name").value;
	const passwordForm = document.getElementById("password").value;
	const user = getParticipantByName(name);
	if(user){
		if (passwordForm === '') {
			alert('Informe uma senha!');
		}else{
			if(user.password === ''){
				user.password = passwordForm;
				await savePassword(user)
				goToHome(user);
			}else{
				if(user.password === passwordForm){
					goToHome(user);
				}else{
					alert('Senha incorreta!')
				}
			}
		}
	}else{
		alert('Usuário não encontrado!');
	}
}

async function isLogged(){
	if(localStorage.getItem("name")){
		const welcome = document.getElementById('welcome');
		welcome.appendChild(document.createTextNode('Bem-vindo(a), ' + localStorage.getItem("name") + '!'));
		const message = document.getElementById('message');
		message.appendChild(document.createTextNode('Seu amigo oculto é: ' + localStorage.getItem("drawn")))
	}else{
		logout();
	}
}

function logout(){
	localStorage.clear();
	window.location.href = "index.html";
}

async function drawFriend(id){
	const drawn = isInDraw(id);
	if(drawn.idDrawn == ""){
		const candidates =  filterCandidates(id);
		const randomDrawn = randomParticipant(candidates);
		await axios.put(`${urlJSON}/${drawn.idJSON}`,
			{
				idParticipant: id,
				idDrawn : randomDrawn.id
			}
		);
		const participant = getParticipantById(randomDrawn.id);
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

function wasDrawn(id){
	return draw.find(item => item.idDrawn == id);
}

function getParticipantById(id){
	return participants.find(participant => participant.id == id);
}

function getParticipantByName(name){
	return participants.find(participant => participant.name == name);
}

function randomParticipant(candidates) {
    let min = Math.ceil(0);
    let max = Math.floor(candidates.length -1);
    let index = Math.floor(Math.random() * (max - min + 1)) + min;
    return candidates[index];
}

function filterCandidates(id){
	const withOutParticipant = participants.filter(person => person.id != id);
	const theUnaffected = withOutParticipant.filter(person => !person.drawn);
	const presenter = wasDrawn(id);
	if(presenter){
		return theUnaffected.filter(person => person.id != presenter.id);
	}
	return theUnaffected;
}
