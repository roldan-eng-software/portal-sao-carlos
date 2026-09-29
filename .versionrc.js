// Configuração do commit-and-tag-version (sucessor mantido do standard-version).
// Mapeia Conventional Commits → seções do formato Keep a Changelog.
// https://keepachangelog.com/en/1.1.0/
module.exports = {
  types: [
    { type: 'feat', section: 'Added' },
    { type: 'fix', section: 'Fixed' },
    { type: 'perf', section: 'Changed' },
    { type: 'refactor', section: 'Changed' },
    { type: 'revert', section: 'Removed' },
    { type: 'docs', section: 'Documentation', hidden: true },
    { type: 'style', section: 'Styles', hidden: true },
    { type: 'chore', section: 'Miscellaneous', hidden: true },
    { type: 'test', section: 'Tests', hidden: true },
    { type: 'build', section: 'Build System', hidden: true },
    { type: 'ci', section: 'CI/CD', hidden: true },
  ],
  commitUrlFormat: 'https://github.com/roldan-eng-software/portal-sao-carlos/commit/{{hash}}',
  compareUrlFormat:
    'https://github.com/roldan-eng-software/portal-sao-carlos/compare/{{previousTag}}...{{currentTag}}',
  issueUrlFormat: 'https://github.com/roldan-eng-software/portal-sao-carlos/issues/{{id}}',
  userUrlFormat: 'https://github.com/{{user}}',
  releaseCommitMessageFormat: 'chore(release): {{currentTag}}',
  header:
    '# Changelog\n\n' +
    'Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.\n\n' +
    'O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),\n' +
    'e este projeto adere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n',
};
