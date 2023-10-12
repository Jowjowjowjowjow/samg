<template>
    <v-container fluid class="historicoIntegralizacao">
        <v-row>
            <strong class="warning text-h5 text-center">AVISO: este simulador foi elaborado apenas com propósitos
                informacionais e não deve ser
                considerado como uma garantia de situação .</strong>
        </v-row>
        <v-row>
            <v-col cols="12">
                <v-file-input
                    label="Usar o histórico emitido no portal do aluno em 'Relatórios >> Histórico Integralização'"
                    variant="solo" ref="historicoIntegralizacao" @change="lerPlanilhaDisciplinas"></v-file-input>
            </v-col>
        </v-row>

        <CurriculoNovo :disciplinas-cursadas="progressoAluno" />

    </v-container>
</template>
<script>
import curriculoNovoObrigatorias from '../assets/Disciplinas Obrigatórias - Currículo novo.json';
import curriculoNovoOptativas from '../assets/Disciplinas Optativas - Curriculo Novo.json';
import CaixaDisciplina from '../components/CaixaDisciplina.vue';
import DetalhesDisciplina from '../components/DetalhesDisciplina.vue';

import instance from '../api/instance';
import CurriculoNovo from '../components/CurriculoNovoIntegralizacao.vue';


export default {
    name: "disciplinasCurriculoNovo",
    data() {
        return {
            disciplinasObrigatorias: curriculoNovoObrigatorias.CurriculoNovo,
            disciplinasOptativas: curriculoNovoOptativas.CurriculoNovoOptativas,
            grade: curriculoNovoObrigatorias.CurriculoNovo,
            disciplinasAlunoCurriculoNovo: [],
            historico: [],
            progressoAluno: [],
            periodos: 8,
        }
    },

    methods: {
        async lerPlanilhaDisciplinas() {
            const arquivo = this.$refs.historicoIntegralizacao.files[0];
            const formData = new FormData();
            formData.append('file', arquivo);
            try {
                const jsonDisciplinasAluno = await instance.post("uploadIntegralizacao", formData, { headers: { 'Content-Type': 'multipart/form-data;boundary=boundary' } })
                this.historico = JSON.parse(JSON.stringify(jsonDisciplinasAluno.data.disciplinas));
                this.lerHistorico();
            } catch (error) {
                console.error(error)
                this.historico = [];
            }

        },

        lerHistorico() {
            //Preenche as disciplinas obrigatórias cursadas pelo aluno
            let disciplinasCursadas = this.disciplinasObrigatorias.map(disciplinaObrigatoria => {
                const disciplina = this.historico.findLast(disciplinaHistorico => disciplinaHistorico.codigo === disciplinaObrigatoria.Codigo);
                if (disciplina) return { ...disciplinaObrigatoria, Situacao: disciplina.situacao, Periodo: disciplinaObrigatoria.PeriodoRecomendado }
                else return disciplinaObrigatoria;
            });

           
            //Preenche as opções de disciplinas optativas cursadas
            disciplinasCursadas = this.preencheOptativas(this.disciplinasOptativas.map(disciplinaOptativa => {
                const disciplina = this.historico.findLast(disciplinaHistoricoAluno => disciplinaHistoricoAluno.codigo === disciplinaOptativa.Codigo)
                if (disciplina) return { ...disciplinaOptativa, Situacao: disciplina.situacao, Tipo: "Optativa", Periodo: 0 }
            }).filter(disciplina => disciplina), disciplinasCursadas)

            //Preenche as opções de disciplinas eletivas cursadas
            disciplinasCursadas = this.preencheEletivas(this.historico.map(disciplinaHistoricoAluno =>
                !disciplinasCursadas.some(disciplina => disciplina.Codigo === disciplinaHistoricoAluno.codigo)
                && {
                    Codigo: disciplinaHistoricoAluno.codigo,
                    Nome: disciplinaHistoricoAluno.nome,
                    CargaHoraria: 60,
                    Creditos: 4,
                    Ementa: null,
                    PreRequisitos: null,
                    Situacao: disciplinaHistoricoAluno.situacao,
                    Tipo: "Eletiva/Optativa",
                    PeriodoRecomendado: 0,
                }
            ).filter(disciplina => disciplina), disciplinasCursadas)
            
            this.progressoAluno = disciplinasCursadas;

        },

        preencheOptativas(optativas, disciplinasCursadas) {
            return disciplinasCursadas.map(disciplina => {
                if (disciplina.Tipo?.includes("Optativa")) {
                    const optativa = optativas.shift();
                    return { ...optativa, PeriodoRecomendado: disciplina.PeriodoRecomendado, Sigla: disciplina.Sigla }
                } else return disciplina;
            });
        },

        preencheEletivas(eletivas, disciplinasCursadas) {
            return disciplinasCursadas.map(disciplina => {
                if (disciplina.Tipo?.includes("Eletiva")) {
                    const eletiva = eletivas.shift();
                    return { ...eletiva, PeriodoRecomendado: disciplina.PeriodoRecomendado, Sigla: disciplina.Sigla }
                } else return disciplina;
            })
        }
    },
    components: { CaixaDisciplina, DetalhesDisciplina, CurriculoNovo }
}
</script>

<style lang="css" scoped>
.historico {
    min-width: 80vw;
    margin-bottom: 24px;
}

.borda-coluna {
    border-right: 1px solid #BDBDBD;
}

.borda-linha {
    border-bottom: 1px solid #BDBDBD;
}

.warning {
    color: #EF5350;
}

.link-equivalencias {
    text-decoration: underline;
}

.link-equivalencias:hover {
    text-decoration: underline;
    background: #1a1a1a;
}
</style>
