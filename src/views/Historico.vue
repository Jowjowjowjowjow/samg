<template>
    <v-container fluid class="historico">
        <v-row>
            <v-card-subtitle>AVISO: este simulador foi elaborado apenas com propósitos informacionais e não deve ser
                considerado como uma garantia de situação após a migração curricular. Leia os anexos do Projeto Pedagógico
                de Curso (PPC) e as comunicações oficiais da Coordenação para mais informações.</v-card-subtitle>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-file-input label="Carregar histórico" variant="solo" ref="historico"
                    @change="lerPlanilhaDisciplinas"></v-file-input>
            </v-col>
        </v-row>
        <CurriculoAtual :disciplinas-cursadas="progressoAlunoGrade" />

        <CurriculoNovo :disciplinas-cursadas="progressoAlunoGradeNova" />
    </v-container>
</template>
<script>
import curriculoAntigoObrigatorias from '../assets/Disciplinas Obrigatórias - Currículo antigo.json';
import curriculoAntigoOptativas from '../assets/Disciplinas Optativas - Curriculo Antigo.json';
import curriculoNovoObrigatorias from '../assets/Disciplinas Obrigatórias - Currículo novo.json';
import curriculoNovoOptativas from '../assets/Disciplinas Optativas - Curriculo Novo.json';
import dePara from '../assets/De - Para.json';
import CaixaDisciplina from '../components/CaixaDisciplina.vue';
import DetalhesDisciplina from '../components/DetalhesDisciplina.vue';

import instance from '../api/instance';
import CurriculoNovo from '../components/CurriculoNovo.vue';
import CurriculoAtual from '../components/CurriculoAtual.vue';

export default {
    name: "disciplinasCurriculoNovo",
    data() {
        return {
            disciplinasObrigatoriasCurriculoAntigo: curriculoAntigoObrigatorias.CurriculoAntigo,
            disciplinasOptativasCurriculoAntigo: curriculoAntigoOptativas.CurriculoAntigoOptativas,
            disciplinasObrigatoriasCurriculoNovo: curriculoNovoObrigatorias.CurriculoNovo,
            disciplinasOptativasCurriculoNovo: curriculoNovoOptativas.CurriculoNovoOptativas,
            disciplinasDePara: JSON.parse(JSON.stringify(dePara['De-Para'])),

            disciplinasCursadasCurriculoAntigo: [],
            periodos: 8,
            disciplinaSelecionada: null,
            disciplinasAlunoCurriculoAntigo: [],
            disciplinasAlunoCurriculoNovo: [],
            totalDisciplinasAluno: [],

            historico: [],
            progressoAlunoGrade: [],
            grade: curriculoAntigoObrigatorias.CurriculoAntigo,
            gradeNova: curriculoNovoObrigatorias.CurriculoNovo,
            progressoAlunoGradeNova: [],
            equivalencias: JSON.parse(JSON.stringify(dePara['De-Para'])),
            naoEquivalentes: []
        }
    },

    methods: {
        async lerPlanilhaDisciplinas() {
            const arquivo = this.$refs.historico.files[0];
            const formData = new FormData();
            formData.append('file', arquivo);
            try {
                const jsonDisciplinasAluno = await instance.post("upload", formData, { headers: { 'Content-Type': 'multipart/form-data;boundary=boundary' } })
                this.disciplinasAlunoCurriculoAntigo = JSON.parse(JSON.stringify(jsonDisciplinasAluno.data.disciplinas));
                this.pegaDisciplinasCursadasCurriculoAntigo();
                this.lerHistorico();
                this.converterDePara();
            } catch (error) {
                console.error(error)
                this.disciplinasAlunoCurriculoAntigo = [];
                this.disciplinasCursadasCurriculoAntigo = []
                this.disciplinasAlunoCurriculoAntigo = []
                this.disciplinasAlunoCurriculoNovo = []
                this.totalDisciplinasAluno = []
            }

        },

        lerHistorico() {
            //Pego somente as obrigatórias
            const obrigatorias = this.disciplinasObrigatoriasCurriculoAntigo.map(disciplinaCurriculoAntigo => {
                const disciplina = this.disciplinasAlunoCurriculoAntigo.findLast(discAluno => discAluno.codigo === disciplinaCurriculoAntigo.Codigo)
                if (disciplina) return { ...disciplinaCurriculoAntigo, Situacao: disciplina.situacao || disciplina.trancamento }
            }).filter(disciplina => disciplina)

            //Pego somente as optativas que o aluno passou
            const optativas = this.preencheOptativas(this.disciplinasOptativasCurriculoAntigo.map(disciplinaOptativaCurriculoAntigo => {
                const disciplina = this.disciplinasAlunoCurriculoAntigo.findLast(discAluno => discAluno.codigo === disciplinaOptativaCurriculoAntigo.Codigo)

                if (disciplina && disciplina.situacao === "Aprovado") return { ...disciplinaOptativaCurriculoAntigo, Situacao: disciplina.situacao, Tipo: "Optativa" }
            }).filter(disciplina => disciplina));

            //Pego somente as eletivas que o aluno passou
            const eletivas = this.preencheEletivas(this.disciplinasAlunoCurriculoAntigo.map(discAluno =>
                !obrigatorias.some(disciplina => disciplina?.Codigo === discAluno.codigo)
                && !optativas.some(disciplina => disciplina?.Codigo === discAluno.codigo)
                && discAluno.situacao === "Aprovado" && {
                    Codigo: discAluno.codigo,
                    Nome: discAluno.nome,
                    CargaHoraria: 60,
                    Creditos: 4,
                    Ementa: null,
                    PreRequisitos: null,
                    Situacao: "Aprovado",
                    Tipo: "Eletiva"
                }).filter(disciplina => disciplina));


            this.historico = [...obrigatorias, ...optativas, ...eletivas]
            this.fazEquivalencias(obrigatorias, [...optativas], [...eletivas]);
            this.progressoAlunoGrade = this.grade.map(disciplina => {

                const eletiva = disciplina.Tipo === "Eletiva" && eletivas.length && eletivas.shift();
                const optativa = disciplina.Tipo === "Optativa" && optativas.length && optativas.shift();
                if (eletiva) return eletiva;
                if (optativa) return optativa;


                const disciplinaHistorico = this.historico.find(hist => hist.Codigo === disciplina.Codigo)
                if (disciplinaHistorico) return disciplinaHistorico;

                return disciplina;
            })


        },

        preencheOptativas(disciplinas) {

            const optativas = [];
            this.disciplinasObrigatoriasCurriculoAntigo.forEach(disciplina => {
                if (disciplina?.Tipo === "Optativa") {
                    const optativa = disciplinas.shift();

                    optativa && optativas.push({ ...disciplina, Sigla: optativa.Sigla, ...optativa })
                }
            })

            return optativas;
        },

        preencheEletivas(disciplinas) {
            const eletivas = [];
            this.disciplinasObrigatoriasCurriculoAntigo.forEach(disciplina => {
                if (disciplina?.Tipo === "Eletiva") {
                    const eletiva = disciplinas.shift();
                    eletiva && eletivas.push({ ...disciplina, ...eletiva })
                }
            })

            return eletivas;
        },

        fazEquivalencias(obrigatorias, optativas, eletivas) {
            const naoAproveitadas = [];
            const materiasDispensadas = this.calculaDispensas();
            console.log(this.calculaDispensas());
            const equivalencias = this.historico.map(disciplina => {
                const codigo = disciplina.Codigo;
                const disciplinaEquivalente = this.equivalencias.find(item => item.codigoCurriculoAntigo === codigo);

                if (disciplinaEquivalente && disciplina?.Situacao.toLowerCase().includes("aprovado") || disciplina?.Situacao.toLowerCase().includes("dispensa")) {
                    return { ...disciplina, Codigo: disciplinaEquivalente.codigoCurriculoNovo }
                }

                if (disciplina.Tipo !== "Eletiva" && (disciplina?.Situacao.toLowerCase().includes("aprovado") || disciplina?.Situacao.toLowerCase().includes("dispensa")) && !materiasDispensadas[1].some(codigo => codigo === disciplina.Codigo)) {
                    naoAproveitadas.push(disciplina);
                }

            }).filter(disciplina => disciplina) // esse filter faz retornar apenas valores diferentes de undefined ou null

            const optativasGradeNova = this.disciplinasOptativasCurriculoNovo.map(optativa => {
                const equivalente = equivalencias.find(equivalencia => equivalencia.Codigo === optativa.Codigo);

                if (equivalente) return { ...optativa, Situacao: equivalente.Situacao, Sigla: optativa.Sigla || equivalente.Sigla }
            }).filter(disciplina => disciplina)

            if (eletivas.length) {
                this.gradeNova = this.gradeNova.map(item => {
                    if (item.Tipo === "Optativa/Eletiva" && eletivas.length) {
                        const eletiva = eletivas.shift();
                        return { ...eletiva, PeriodoRecomendado: item.PeriodoRecomendado, Situacao: eletiva.Situacao }
                    }
                    return item;
                })
            }

            this.progressoAlunoGradeNova = this.gradeNova.map(item => {
                if (materiasDispensadas[0].some(codigo => codigo === item.Codigo)) return {...item, Situacao: "Dispensa sem nota"}

                const disciplina = equivalencias.find(equivalencia => equivalencia.Codigo === item.Codigo)

                if (item.Tipo.includes("Optativa") && item.Codigo.includes("OPT") && optativasGradeNova.length) {
                    const optativa = optativasGradeNova.shift();
                    return { ...optativa, PeriodoRecomendado: item.PeriodoRecomendado, Tipo: item.Tipo, Sigla: optativa.Sigla || item.Sigla }
                }
                if (disciplina) return { ...disciplina, PeriodoRecomendado: item.PeriodoRecomendado, Tipo: item.Tipo }
                return { ...item, Situacao: item.Situacao || "Matrícula" }
            })

            this.naoEquivalentes = [...naoAproveitadas]
            console.log(naoAproveitadas);
        },

        calculaDispensas() {
            const disciplinas = this.historico.filter(item => item.Sigla.toLowerCase().includes("ace"));
            const TPD = this.historico.find(item => item.Codigo === "HTD0058");
            const dispensas = [];
            const utilizadas = [];
            if(disciplinas.length === 4){
                dispensas.push("TIN0151", "TIN0152", "TIN9999" )
                utilizadas.push(disciplinas[0].Codigo, disciplinas[1].Codigo, disciplinas[2].Codigo, disciplinas[3].Codigo)
            } else if(disciplinas.length == 3) {
                dispensas.push("TIN0151", "TIN0152")
                utilizadas.push(disciplinas[0].Codigo, disciplinas[1].Codigo, disciplinas[2].Codigo)
            } else if(disciplinas.length == 2 && disciplinas.some(disciplina => disciplina.Codigo === "TIN0156" || disciplina.Codigo === "TIN0157") && TPD){
                dispensas.push("TIN0151", "TIN9999")
                utilizadas.push(disciplinas[0].Codigo, disciplinas[1].Codigo, TPD.Codigo)
            } else if (disciplinas.length >= 1 && TPD) {
                dispensas.push("TIN0151")
                utilizadas.push(...disciplinas.map(disciplina => disciplina.Codigo), TPD.Codigo)
            }
            return [dispensas, utilizadas]
        },

        pegaDisciplinasOptativasCurriculoAntigo() {
            const parseDisciplinasOptativasCurriculoAntigo = JSON.parse(JSON.stringify(this.disciplinasOptativasCurriculoAntigo));
            const optativasAluno = [];

            this.disciplinasAlunoCurriculoAntigo.forEach(disciplinaAluno => {
                const cursada = parseDisciplinasOptativasCurriculoAntigo.findLast(disciplinaOptativa => disciplinaOptativa.Codigo === disciplinaAluno.codigo ? JSON.parse(JSON.stringify(disciplinaOptativa)) : undefined)

                if (cursada !== undefined && JSON.parse(JSON.stringify(disciplinaAluno)).situacao.includes("Aprovado")) {
                    optativasAluno.push({
                        Codigo: cursada.Codigo,
                        Nome: cursada.Nome,
                        CargaHoraria: cursada.CargaHoraria,
                        Creditos: cursada.Creditos,
                        PeriodoRecomendado: cursada.PeriodoRecomendado,
                        Sigla: cursada.Sigla,
                        Situacao: disciplinaAluno.situacao || disciplinaAluno.trancamento,
                        Tipo: 'Optativa'
                    });
                }

            })

            const novoArrayOptativas = [];

            for (let i = 0; i < 8; i++) {
                if (optativasAluno[i]?.Codigo) {
                    novoArrayOptativas.push({
                        ...optativasAluno[i],
                        PeriodoRecomendado: i === 0 || i === 1 ? 6 : i <= 4 ? 7 : 8
                    })
                }
                else novoArrayOptativas.push({
                    Codigo: `OPT000${i}`,
                    Nome: `Disciplina Optativa V${i}`,
                    CargaHoraria: null,
                    Creditos: null,
                    PeriodoRecomendado: i === 0 || i === 1 ? 6 : i <= 4 ? 7 : 8,
                    Sigla: `OPT V${i}`,
                    Tipo: 'Optativa'
                })

            }

            return JSON.parse(JSON.stringify(novoArrayOptativas));
        },

        pegaDisciplinasCursadasCurriculoAntigo() {
            const disciplinas = JSON.parse(JSON.stringify(this.disciplinasObrigatoriasCurriculoAntigo))
            const optativas = this.pegaDisciplinasOptativasCurriculoAntigo();
            const disciplinasCursadasCurriculoAntigo = []
            disciplinas.forEach(disciplina => {
                const disciplinaCursada = this.disciplinasAlunoCurriculoAntigo.findLast(disciplinaAluno => disciplinaAluno.codigo === disciplina.Codigo);
                if (disciplinaCursada !== undefined) {
                    disciplinasCursadasCurriculoAntigo.push({ ...disciplina, Situacao: disciplinaCursada.situacao })
                }
                else if (disciplina.Tipo === 'Eletiva') {
                    disciplinasCursadasCurriculoAntigo.push({ ...disciplina, Situacao: "Matricula" })
                }
                else if (disciplina.Tipo === 'Obrigatoria') disciplinasCursadasCurriculoAntigo.push(disciplina)
            })

            let totalDisciplinas = [...disciplinasCursadasCurriculoAntigo, ...optativas];
            const eletivas = this.disciplinasAlunoCurriculoAntigo.filter(disciplina => {
                if (!totalDisciplinas.findLast(td => td.Codigo === disciplina.codigo) && disciplina.situacao === "Aprovado") return {
                    Nome: disciplina.nome,
                    Codigo: disciplina.codigo,
                    Situacao: "Aprovado"
                }
            })

            eletivas.forEach(eletiva => {
                const iEletiva = totalDisciplinas.findIndex(disciplina => disciplina.Tipo === "Eletiva" && disciplina.Situacao === "Matricula");
                const stringifyEletiva = JSON.parse(JSON.stringify(eletiva))
                totalDisciplinas[iEletiva] = { ...totalDisciplinas[iEletiva], Codigo: stringifyEletiva.codigo, Situacao: stringifyEletiva.situacao, Nome: stringifyEletiva.nome }
            })

            this.disciplinasCursadasCurriculoAntigo = totalDisciplinas;

        },

        converterDePara() {
            const disciplinasOptativasCursadas = [];
            const disciplinasEletivasCursadasAntigo = this.disciplinasCursadasCurriculoAntigo.filter(disciplina => disciplina.Tipo === "Eletiva" && disciplina.Situacao === "Aprovado");
            this.totalDisciplinasAluno = JSON.parse(JSON.stringify(this.disciplinasObrigatoriasCurriculoNovo.map(disciplinaCurriculoNovo => {
                if (disciplinaCurriculoNovo.Tipo === "Optativa") {
                    const disciplinaMapeada = this.disciplinasDePara.find(dePara => this.disciplinasCursadasCurriculoAntigo.some(disciplinaAntiga => dePara.codigoCurriculoAntigo === disciplinaAntiga.Codigo && disciplinaAntiga.Tipo === "Optativa" && !disciplinasOptativasCursadas.some(opt => opt.codigoCurriculoNovo === dePara.codigoCurriculoNovo)) && dePara);
                    if (disciplinaMapeada) {
                        disciplinasOptativasCursadas.push(disciplinaMapeada);
                        return { ...this.disciplinasCursadasCurriculoAntigo.find(disciplina => disciplina.Codigo === disciplinaMapeada.codigoCurriculoAntigo), Codigo: disciplinaMapeada.codigoCurriculoNovo, PeriodoRecomendado: disciplinaCurriculoNovo.PeriodoRecomendado }
                    }
                    else return disciplinaCurriculoNovo;
                }

                if (disciplinaCurriculoNovo.Tipo === "Optativa/Eletiva") {
                    if (disciplinasEletivasCursadasAntigo.length) {
                        return { ...disciplinasEletivasCursadasAntigo.shift(), PeriodoRecomendado: disciplinaCurriculoNovo.PeriodoRecomendado };
                    } else {
                        const disciplinaMapeada = this.disciplinasDePara.find(dePara => this.disciplinasCursadasCurriculoAntigo.some(disciplinaAntiga => dePara.codigoCurriculoAntigo === disciplinaAntiga.Codigo && disciplinaAntiga.Tipo === "Optativa" && !disciplinasOptativasCursadas.some(opt => opt.codigoCurriculoNovo === dePara.codigoCurriculoNovo)) && dePara);
                        if (disciplinaMapeada) {
                            disciplinasOptativasCursadas.push(disciplinaMapeada);
                            return { ...this.disciplinasCursadasCurriculoAntigo.find(disciplina => disciplina.codigo === disciplinaMapeada.codigoCurriculoAntigo), Codigo: disciplinaMapeada.codigoCurriculoNovo, PeriodoRecomendado: disciplinaCurriculoNovo.PeriodoRecomendado }
                        } else return disciplinaCurriculoNovo
                    }
                }

                const disciplinaNova = this.disciplinasDePara.find(dePara => dePara.codigoCurriculoNovo === disciplinaCurriculoNovo.Codigo);
                if (!disciplinaNova) return { ...disciplinaCurriculoNovo, Situacao: "Matrícula" }

                const disciplinaMapeada = this.disciplinasCursadasCurriculoAntigo.findLast(disciplinaAntiga => disciplinaAntiga.Codigo === disciplinaNova.codigoCurriculoAntigo);
                if (disciplinaMapeada) return { ...disciplinaCurriculoNovo, Situacao: disciplinaMapeada.Situacao ? disciplinaMapeada.Situacao : "Matrícula" }
                else return disciplinaCurriculoNovo
            })))

        },

    },
    components: { CaixaDisciplina, DetalhesDisciplina, CurriculoNovo, CurriculoAtual }
}
</script>

<style lang="css" scoped>
.historico {
    min-width: 80vw;
}

.borda-coluna {
    border-right: 1px solid #BDBDBD;
}

.borda-linha {
    border-bottom: 1px solid #BDBDBD;
}
</style>