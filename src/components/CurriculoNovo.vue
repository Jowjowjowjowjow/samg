<template>
    <v-row>
        <v-col cols="12" class="d-flex align-center">
            <v-card-title>Currículo novo</v-card-title>
            <v-spacer></v-spacer>
            <v-icon :icon="manipulaOlho" @click="ver = !ver" />
        </v-col>
        <v-col v-show="ver" v-for="i in periodos" :key="i" class="pa-6" :class="{ 'borda-coluna': i < 8 }">
            <div class="mb-8 borda-linha">{{ `${i}° período` }}</div>

            <v-row v-if="disciplinasCursadas.length" v-for="disciplina in disciplinasCursadas" :key="disciplina.Codigo">
                <CaixaDisciplina v-if="disciplina.PeriodoRecomendado === i" @click="disciplinaSelecionada = disciplina"
                    :disciplina="disciplina" class="mb-4" :cor="corPorStatus(disciplina.Situacao)" :eixo="eixoCor[disciplina?.Eixo]"/>
            </v-row>
            <v-row v-else v-for="disciplina in disciplinasObrigatorias" :key="disciplina.Codigo + 'index'">
                <CaixaDisciplina v-if="disciplina.PeriodoRecomendado === i" @click="disciplinaSelecionada = disciplina"
                    :disciplina="disciplina" class="mb-4" :cor="eixoCor[disciplina?.Eixo]" />
            </v-row>
        </v-col>
        <v-dialog v-if="disciplinaSelecionada !== null" v-model="disciplinaSelecionada">
            <DetalhesDisciplina :disciplina="disciplinaSelecionada" />
        </v-dialog>
    </v-row>
</template>
<script>
import curriculoNovoObrigatorias from '../assets/Disciplinas Obrigatórias - Currículo novo.json';
import CaixaDisciplina from './CaixaDisciplina.vue';
import DetalhesDisciplina from './DetalhesDisciplina.vue';

const EIXO_COR = {
    "Atividades complementares": "#78909C",
    "Atividades de extensão": "#6D4C41",
    "Trabalho de conclusão de curso": "#00ACC1",
    "Infraestrutura em SI": "#F06292",
    "Engenharia de Dados e Informação": "#81C784",
    "Desenvolvimento de Software para SI (Engenharia de Software)": "#5C6BC0",
    "Desenvolvimento de Software para SI (Programação e Algoritmos)": "#64B5F6",
    "Gestão de SI e TI, Empreendedorismo e Inovação": "#7E57C2",
    "Visão Sistêmica (Fundamentos de Matemática)": "#FFCC80",
    "Visão Sistêmica (Sistemas de Informação)": "#FFEE58"
}


export default {
    name: "curriculo-novo",
    props: {
        disciplinasCursadas: {
            required: true,
            type: Array,
            default: () => []
        }
    },
    data: () => ({
        disciplinasObrigatorias: curriculoNovoObrigatorias.CurriculoNovo,
        disciplinaSelecionada: null,
        periodos: 8,
        ver: true,
        eixoCor: EIXO_COR
    }),
    computed: {
        manipulaOlho() {
            return this.ver ? "$eye" : "$offEye"
        }
    },
    methods: {
        corPorStatus(situacao) {
            if (!situacao) return '#F5F5F5';
            switch (situacao.toLowerCase()) {
                case "aprovado": return "green";
                case "reprovado sem nota": return "orange";
                case "reprovado por falta": return "red";
                case "aprovado sem nota": return "green";
                case "dispensa sem nota": return "yellow";
                case "dispensa com nota": return "yellow";
                case "matrícula": return '#F5F5F5';
                default: return '#F5F5F5';
            }
        },
    },
    components: { DetalhesDisciplina, CaixaDisciplina }
}
</script>