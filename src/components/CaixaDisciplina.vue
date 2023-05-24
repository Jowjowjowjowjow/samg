<template>
    <v-card class="pa-2 largura-caixa" :color="cor">
        <v-icon :icon="status.ver === 'check' ? '$check' : '$unCheck'" :color="status.cor" class="icone"></v-icon>
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
        status: { type: Object, default: () => ({ ver: false, cor: "" }) },
        cor: { type: String, default: () => '' },
        eixo: { type: String, default: () => '' }
    },
    computed: {
        corFundoCartao() {
            if (this.cor === "#BDBDBD") return this.eixo;
            else return this.cor;
        },
    }
}
</script>
<style scoped>
.largura-caixa {
    width: 120px;
}

.icone {
    position: absolute !important;
    right: 4px;
}

.v-card:hover {
   filter: brightness(70%)!important;
}
</style>