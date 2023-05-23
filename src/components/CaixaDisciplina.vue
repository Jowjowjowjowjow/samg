<template>
    <v-card class="pa-2 largura-caixa" :color="corFundoCartao">
        <v-icon v-if="status" icon="$check" color="#1B5E20"></v-icon>
        <v-card-title>{{ disciplina.Sigla }}</v-card-title>
        <v-card-subtitle>{{ disciplina.codigo }}</v-card-subtitle>
    </v-card>
</template>
<script>
export default {
    name: 'CaixaDisciplina',
    props: {
        disciplina: {
            type: Object,
            required: true,
            default: () => { }
        },
        status: { type: Boolean, default: false },
        cor: { type: String, default: () => '' },
        eixo: { type: String, default: () => '' }
    },
    computed: {
        corFundoCartao() {
            if (this.cor === "#F5F5F5") return this.eixo;
            else return this.cor;
        },
    }
}
</script>
<style>
.largura-caixa {
    width: 120px;
}
</style>