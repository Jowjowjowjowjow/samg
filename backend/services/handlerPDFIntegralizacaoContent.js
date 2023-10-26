const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const regexCodigoDisciplina = new RegExp(/[a-zA-Z]{3}[0-9]{4}/i);
const regexSituacao = new RegExp(/(Vencido|Não Vencido|Matricula\/Cursand)/gmi);
//Melhorar, casos de nomes de disciplina muito grandes e que acabam quebrando em duas linhas não estão sendo contemplados.
const regexNomeDisciplina = new RegExp(/([A-Za-záãÁÀÃÂÉÈÊéàêÍÌÎÓÒÕÔóí\-ÚÙÛÇç\s]*)[a-zA-Z]{3}[0-9]{4}/i);

const criaVetorDisciplinas = (disciplinas) => {
    const vetorDisciplinas = disciplinas.map(disciplina => ({
        codigo: disciplina.disciplina.match(regexCodigoDisciplina) && disciplina.disciplina.match(regexCodigoDisciplina).toString(),
        situacao: disciplina.disciplina.match(regexSituacao) && disciplina.disciplina.match(regexSituacao).toString(),
        nome: disciplina.disciplina.match(regexNomeDisciplina).toString().split(regexCodigoDisciplina)[0],
    }))
    console.log('VetorDisciplinasIntegralizacao: ', vetorDisciplinas);
    return vetorDisciplinas;
}

const readPdfIntegralizacao = async (uri) => {

    const buffer = fs.readFileSync(path.resolve(__dirname, "../" + uri));

    try {
        const data = await pdfParse(buffer);
        const splitted = data.text.split('\n')
        console.log('splitted:', splitted)

        let disciplinas = [];
        for (let i = 0; i < splitted.length; i++) {
            console.log('Linha: ', splitted[i], ' regexCodigoDisciplina: ', regexCodigoDisciplina.test(splitted[i]), ' regexSituacao: ', regexSituacao.test(splitted[i]), ' regexNome: ', regexNomeDisciplina.test(splitted[i]) )
            if (regexCodigoDisciplina.test(splitted[i])) {
                disciplinas.push({ disciplina: splitted[i] });
            }

        }
        return criaVetorDisciplinas(disciplinas);
    } catch (err) {
        throw new Error(err);
    }
}
module.exports = readPdfIntegralizacao;