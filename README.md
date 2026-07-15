[README (2).md](https://github.com/user-attachments/files/30033896/README.2.md)
# Sistema de Gestão Hospitalar Dra. Yuska Maritan Brito - Etapa 1

Este repositório contém a primeira etapa do desenvolvimento do banco de dados relacional para o Hospital Universitário Dra. [cite_start]Yuska Maritan Brito[cite: 3]. [cite_start]O projeto engloba a modelagem conceitual, lógica e física do sistema, com a implementação de scripts DDL e DML utilizando SQL puro (sem o uso de ORMs nesta fase)[cite: 20, 28].

Toda a carga inicial foi gerada utilizando dados 100% simulados. O banco está a rodar num ambiente restrito de desenvolvimento, sem a recolha de dados reais de pacientes, assegurando a total privacidade e segurança das informações durante a fase de testes da infraestrutura.

# Arquitetura e Modelagem

[cite_start]O projeto foi rigorosamente normalizado até à **3ª Forma Normal (3FN)**[cite: 20]. A principal decisão arquitetural de destaque é a **Especialização da Entidade Pessoa**:
Para evitar redundâncias e valores nulos (`NULL`) indesejados, a tabela central `PESSOA` foi desmembrada utilizando o conceito de herança relacional. [cite_start]Ela divide-se de forma mutuamente exclusiva para as regras de negócio de base em `PACIENTE` e `PROFISSIONAL`[cite: 4, 5]. [cite_start]Posteriormente, a entidade `PROFISSIONAL` especializa-se em `RESIDENTE` e `PRECEPTOR`, garantindo que chaves e dependências funcionais fiquem perfeitamente isoladas[cite: 6].

[cite_start]O Modelo Relacional (Diagrama de Entidade-Relacionamento) completo em formato PDF, com todas as justificativas de cardinalidades, encontra-se na raiz deste repositório[cite: 51, 52].

# Como Instalar e Executar

**Pré-requisitos:**
* [cite_start]SGBD PostgreSQL (Recomendado) ou MySQL[cite: 24].
* [cite_start]Ferramenta de execução de queries (DBeaver, pgAdmin, ou CLI)[cite: 25].

Para que o sistema funcione corretamente e sem erros de dependência de chaves estrangeiras, os scripts devem ser executados **estritamente na ordem abaixo**:

### Passo 1: Infraestrutura e Carga Inicial (DDL)
Execute primeiro o script de criação das tabelas. [cite_start]Ele contém as instruções `DROP TABLE IF EXISTS ... CASCADE` para garantir a idempotência do ambiente, seguido pelos comandos `CREATE TABLE` com todas as *constraints* (PK, FK, UNIQUE, CHECK)[cite: 55].
* **Ficheiro:** `01_criacao_tabelas_e_carga.sql` (ou o nome exato que o Vinicius colocou)
* [cite_start]*Nota:* Este script já inclui o povoamento do banco com a massa de dados simulada (pacientes, profissionais, unidades, atendimentos e procedimentos) exigida para testes[cite: 56].

### Passo 2: Operações Diárias (DML Essencial)
Após as tabelas estarem povoadas, execute o script de CRUD. [cite_start]Ele contém as queries puras responsáveis por inserir novos atendimentos validando regras de negócio, atualizar dados cadastrais e listar informações fundamentais da rotina hospitalar[cite: 57, 58, 59, 60, 61].
* **Ficheiro:** `02_consultas_crud_basico.sql` (ou o nome exato dado pela Pessoa 3)

### Passo 3: Inteligência Analítica (DML Avançado)
Por fim, execute o script focado em relatórios gerenciais e agregação de dados. [cite_start]Este ficheiro demonstra a capacidade analítica da arquitetura através de *rankings* de atendimento por residente, volumetria de plantões e cruzamento de níveis de risco[cite: 63, 64, 65, 66].
* **Ficheiro:** `03_consultas_analiticas.sql` (ou o nome exato dado pela Pessoa 4)

#Próximos Passos (Etapa 2)

A infraestrutura consolidada nesta primeira fase serve como fundação de alta disponibilidade. [cite_start]Na próxima etapa, o sistema receberá gatilhos (*Triggers*), procedimentos armazenados (*Stored Procedures*) e será integrado a um backend robusto (como Python e Flask) através de Mapeamento Objeto-Relacional (ORM)[cite: 71, 94]. Esta base relacional limpa suportará o posterior mapeamento de fluxos lógicos, fundamental para a elaboração de robôs de atendimento, além de fornecer os dados metodológicos necessários para a escrita do nosso relato técnico e artigo científico.
