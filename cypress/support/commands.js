// Comandos personalizados reutilizables

Cypress.Commands.add('loginMock', () => {
  // Inyecta usuario falso en localStorage/cache para saltarse el login en tests
  cy.window().then((win) => {
    const mockUser = {
      nombre: 'Carlos Test',
      matricula: '123456',
      carrera: 'Ingeniería en Sistemas Computacionales',
      creditos: 76,
    }
    win.localStorage.setItem('cache_usuario', JSON.stringify({ data: mockUser, ts: Date.now() }))
  })
})
