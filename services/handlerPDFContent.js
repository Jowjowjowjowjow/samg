const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const regexDisciplina = new RegExp(/^[a-zA-Z]{3}[0-9]{4}/mi);
const regexSituacao = new RegExp(/(aprovado.*|reprovado.*|matrícula.*|trancamento.*|dispensa.*)$/gmi);
const regexTrancamento = new RegExp(/(trancamento.*)$/gmi);
//Melhorar, casos de nomes de disciplina muito grandes e que acabam quebrando em duas linhas não estão sendo contemplados.
const regexNomeDisciplina = new RegExp(/[a-zA-Z]{3}[0-9]{4}([A-Za-záãÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇ\s]*)/gmi);
const regexPegaPeriodo = new RegExp(/([0-9]°. semestre de [0-9]{4})/gmi);
const regexPegaCursoFerias = new RegExp(/(Curso de Férias de [0-9]{4})/gmi);
const regexPegaSemestre = new RegExp(/^[0-9]{1}/gmi);
const regexPegaAno = new RegExp(/[0-9]{4}/gmi);

const criaVetorDisciplinas = (disciplinas) => {
   // console.log(disciplinas)
    const vetorDisciplinas = disciplinas.map(disciplina => ({
        codigo: disciplina.disciplina.match(regexDisciplina) && disciplina.disciplina.match(regexDisciplina).toString(),
        situacao: disciplina.disciplina.match(regexSituacao) && disciplina.disciplina.match(regexSituacao).toString(),
        trancamento: disciplina.disciplina.match(regexTrancamento) && disciplina.disciplina.match(regexTrancamento).toString(),
        nome: disciplina.disciplina.match(regexNomeDisciplina).toString().split(regexDisciplina)[1],
        periodo: formataPeriodo(disciplina.periodo)
        //periodo: disciplina.periodo.match(regexPegaPeriodo)?.toString() || disciplina.periodo.match(regexPegaCursoFerias)?.toString()
        //periodo: disciplina.periodo.match(regexPegaPeriodo)
    }))

    //console.log("Vetor disciplinas ", vetorDisciplinas);

    return vetorDisciplinas;
}

function formataPeriodo(periodo) {
    console.log("eita ", periodo)
    if(regexPegaPeriodo.test(periodo)) {
        console.log("periodo ", periodo.toString().trim().match(regexPegaAno).toString().concat(".", periodo.match(regexPegaSemestre)))
        return periodo.toString().trim().match(regexPegaAno).toString().concat(".", periodo.match(regexPegaSemestre));
    } else if(regexPegaCursoFerias.test(periodo)) {
        console.log("ferias ", periodo.match(regexPegaAno).toString().concat(" Ferias"))
        return periodo.match(regexPegaAno).toString().concat(" Ferias");
    }
}

const readPdf = async (uri) => {

    const buffer = fs.readFileSync(path.resolve(__dirname, "../" + uri));

    try {
        const data = await pdfParse(buffer);

        const splitted = data.text.split('\n')
        let periodo = "";

        let disciplinas = [];
        for (let i = 0; i < splitted.length; i++) {
            //console.log(splitted[i], i)
            if (regexTrancamento.test(splitted[i])) {
                continue;
            }

            if (regexPegaPeriodo.test(splitted[i]) || regexPegaCursoFerias.test(splitted[i])){
                periodo = splitted[i];
            } 
        

            if (regexDisciplina.test(splitted[i]) && regexSituacao.test(splitted[i])) {

                disciplinas.push({ disciplina: splitted[i], periodo });
                continue;
            }

            if (regexDisciplina.test(splitted[i])) {
                let disciplina = '';
                let j = i;
                do {
                    disciplina += splitted[j];
                    j++;
                } while (!regexSituacao.test(splitted[j - 1]));
                disciplinas.push({ disciplina, periodo });
            }
        }

        return criaVetorDisciplinas(disciplinas);
    } catch (err) {
        throw new Error(err);
    }
}

module.exports = readPdf;