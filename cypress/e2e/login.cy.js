describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login')
    cy.wait(1100)
  })

  it('muestra el formulario de login', () => {
    cy.get('input[placeholder="Ingresa tu ID"]').should('be.visible')
    cy.wait(1400)
    cy.get('input[placeholder="Ingresa tu contraseña"]').should('be.visible')
    cy.wait(1000)
  })

  it('el botón Iniciar sesión está visible', () => {
    cy.get('button.submit-btn').should('be.visible')
    cy.wait(1000)
  })

  it('muestra error con campos vacíos', () => {
    cy.get('button.submit-btn').click()
    cy.wait(1100)
    cy.get('.error-box').should('be.visible')
    cy.wait(1000)
  })

  it('el link Contactar Soporte abre la URL correcta', () => {
    // Cypress no puede abrir pestañas nuevas — interceptamos window.open
    cy.window().then(win => cy.stub(win, 'open').as('windowOpen'))
    cy.wait(900)
    cy.contains('Contactar Soporte').should('be.visible')
    cy.wait(1000)
    cy.contains('Contactar Soporte').click()
    cy.wait(1100)
    cy.get('@windowOpen').should('have.been.calledOnceWith', 'https://servicedeskweb.udlap.mx/', '_blank')
    cy.wait(900)
  })

  it('inicia sesión con credenciales reales y redirige a /biometric', () => {
    cy.get('input[placeholder="Ingresa tu ID"]').type(Cypress.env('UDLAP_ID'), { delay: 150 })
    cy.wait(900)
    cy.get('input[placeholder="Ingresa tu contraseña"]').type(Cypress.env('UDLAP_PASSWORD'), { delay: 150 })
    cy.wait(900)
    cy.get('button.submit-btn').click()
    cy.wait(1400)
    cy.url({ timeout: 10000 }).should('include', '/biometric')
    cy.wait(1000)
  })

  it('flujo completo: login → reconocimiento facial → home', () => {
    // Login
    cy.get('input[placeholder="Ingresa tu ID"]').type(Cypress.env('UDLAP_ID'), { delay: 150 })
    cy.wait(900)
    cy.get('input[placeholder="Ingresa tu contraseña"]').type(Cypress.env('UDLAP_PASSWORD'), { delay: 150 })
    cy.wait(900)
    cy.get('button.submit-btn').click()
    cy.url({ timeout: 10000 }).should('include', '/biometric')
    cy.wait(1100)

    // Pantalla biométrica — clic en reconocimiento facial
    cy.contains('Usar Reconocimiento Facial').should('be.visible')
    cy.wait(1000)
    cy.contains('Usar Reconocimiento Facial').click()
    cy.wait(1000)

    // Scanning — espera animación (2 s automático)
    cy.url().should('include', '/biometric/scanning')
    cy.wait(2500)

    // Success — espera redirección (1.8 s automático)
    cy.url().should('include', '/biometric/success')
    cy.wait(2200)

    // Home
    cy.url().should('include', '/home')
    cy.wait(1000)
  })
})
