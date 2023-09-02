const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const regexCodigoDisciplina = new RegExp(/^[a-zA-Z]{3}[0-9]{4}/mi);
const regexSituacao = new RegExp(/(Vencido.*|Não Vencido.*|Matrícula.*)$/gmi);
//Melhorar, casos de nomes de disciplina muito grandes e que acabam quebrando em duas linhas não estão sendo contemplados.
const regexNomeDisciplina = new RegExp(/[a-zA-Z]{3}[0-9]{4}([A-Za-záãÁÀÃÂÉÈÊÍÌÎÓÒÕÔÚÙÛÇ\s]*)/gmi);
const regexPegaPeriodo = new RegExp(/([0-9]°. semestre - [0-9]{4})/gmi);
/*const regexPegaCursoFerias = new RegExp(/(Curso de Férias de [0-9]{4})/gmi);*/
const regexPegaSemestre = new RegExp(/^[0-9]{1}/gmi);
const regexPegaAno = new RegExp(/[0-9]{4}/gmi);

const criaVetorDisciplinas = (disciplinas) => {
    const vetorDisciplinas = disciplinas.map(disciplina => ({
        codigo: disciplina.disciplina.match(regexCodigoDisciplina) && disciplina.disciplina.match(regexCodigoDisciplina).toString(),
        situacao: disciplina.disciplina.match(regexSituacao) && disciplina.disciplina.match(regexSituacao).toString(),
        nome: disciplina.disciplina.match(regexNomeDisciplina).toString().split(regexCodigoDisciplina)[1],
        periodo: disciplina.periodo
    }))
    return vetorDisciplinas;
}

const readPdfIntegralizacao = async (uri) => {

    const buffer = fs.readFileSync(path.resolve(__dirname, "../" + uri));

    try {
        const data = await pdfParse(buffer);

        const splitted = data.text.split('\n')
        let periodo = "";

        let disciplinas = [];
        for (let i = 0; i < splitted.length; i++) {

            if (regexPegaPeriodo.test(splitted[i])){
                periodo = splitted[i].match(regexPegaAno).toString() + "." + splitted[i].match(regexPegaSemestre)
            } 

            /*if (regexPegaCursoFerias.test(splitted[i])){
                periodo = splitted[i].match(regexPegaAno).toString() + " Ferias" 
            }*/
        
            if (regexCodigoDisciplina.test(splitted[i]) && regexSituacao.test(splitted[i])) {
                disciplinas.push({ disciplina: splitted[i], periodo });
                continue;
            }

            if (regexCodigoDisciplina.test(splitted[i])) {
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
module.exports = readPdfIntegralizacao;