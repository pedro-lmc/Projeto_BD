const express = require('express');
const router = express.Router();
const atendimentoController = require('../controllers/atendimentoController');
const pacienteController = require('../controllers/pacienteController');
const leitoController = require('../controllers/leitoController');
const configuracaoController = require('../controllers/configuracaoController');
const evolucaoController = require('../controllers/evolucaoController');

router.get('/atendimentos', atendimentoController.listarAtendimentos);
router.get('/atendimentos/hoje', atendimentoController.listarAtendimentos);
router.post('/atendimentos', atendimentoController.criarAtendimento);
router.patch('/atendimentos/:id/status', atendimentoController.atualizarStatus);
router.delete('/atendimentos/:id', atendimentoController.excluirAtendimento);

router.get('/pacientes', pacienteController.listarPacientes);
router.post('/pacientes', pacienteController.criarPaciente);
router.put('/pacientes/:id', pacienteController.atualizarPaciente);
router.delete('/pacientes/:id', pacienteController.excluirPaciente);
router.get('/pacientes/:pacienteId/evolucoes', evolucaoController.listarEvolucoesPorPaciente);

router.get('/leitos', leitoController.listarLeitos);
router.get('/leitos/pacientes-disponiveis', leitoController.listarPacientesDisponiveis);
router.post('/leitos/:id/paciente', leitoController.adicionarPaciente);
router.delete('/leitos/:id/paciente', leitoController.removerPaciente);
router.post('/leitos/:id/limpar', leitoController.limparLeito);

router.get('/configuracoes', configuracaoController.obterConfiguracao);
router.put('/configuracoes', configuracaoController.atualizarConfiguracao);

router.post('/evolucoes', evolucaoController.criarEvolucao);

module.exports = router;