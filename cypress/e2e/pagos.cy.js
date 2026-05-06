describe('Pagos', () => {
  it('flujo completo: home → pagos → bancos → facturación → PDF → contactos', () => {
    // Desde Home, buscar y entrar a Pagos
    cy.visit('/home')
    cy.wait(1100)
    cy.get('.search-bar input').type('Pagos', { delay: 150 })
    cy.wait(1100)
    cy.get('.search-results').should('be.visible')
    cy.wait(900)
    cy.contains('.search-result-item', 'Pagos').click()
    cy.wait(1100)
    cy.url().should('include', '/pagos')
    cy.wait(1400)

    // Desglosar pantalla principal de Pagos
    cy.contains('Estado de cuenta').should('be.visible')
    cy.wait(900)
    cy.contains('Apoyo educativo').scrollIntoView()
    cy.wait(1000)
    cy.contains('Bancos para pago').scrollIntoView()
    cy.wait(1000)
    cy.contains('Información de facturación').should('be.visible')
    cy.wait(900)
    cy.contains('Descargar estado de cuenta en PDF').scrollIntoView()
    cy.wait(1000)

    // Entrar a Bancos para pago
    cy.contains('.pagos-link', 'Bancos para pago').click()
    cy.wait(1100)
    cy.contains('Bancos').should('be.visible')
    cy.wait(1000)

    // Desplazarse por cada banco
    cy.contains('BBVA').scrollIntoView()
    cy.wait(900)
    cy.contains('BBVA').should('be.visible')
    cy.wait(900)
    cy.contains('Banorte').scrollIntoView()
    cy.wait(900)
    cy.contains('Banorte').should('be.visible')
    cy.wait(900)
    cy.contains('HSBC').scrollIntoView()
    cy.wait(900)
    cy.contains('HSBC').should('be.visible')
    cy.wait(900)
    cy.contains('Citibanamex').scrollIntoView()
    cy.wait(900)
    cy.contains('Citibanamex').should('be.visible')
    cy.wait(900)
    cy.contains('Santander').scrollIntoView()
    cy.wait(900)
    cy.contains('Santander').should('be.visible')
    cy.wait(1000)

    // Cerrar bancos y regresar a Pagos
    cy.get('.bancos-close').click()
    cy.wait(1100)
    cy.contains('Estado de cuenta').should('be.visible')
    cy.wait(1000)

    // Entrar a Información de facturación
    cy.contains('.pagos-link', 'Información de facturación').click()
    cy.wait(1100)
    cy.contains('Información de facturación').should('be.visible')
    cy.wait(1000)

    // Desglosar facturación
    cy.contains('Calendario').scrollIntoView()
    cy.wait(900)
    cy.contains('Enero').should('be.visible')
    cy.wait(1400)
    cy.contains('Febrero').should('be.visible')
    cy.wait(1400)
    cy.contains('Marzo').should('be.visible')
    cy.wait(1400)
    cy.contains('Abril').scrollIntoView()
    cy.wait(900)
    cy.contains('Solicitud de factura').scrollIntoView()
    cy.wait(900)
    cy.contains('¿Necesitas ayuda?').scrollIntoView()
    cy.wait(1000)

    // Regresar a Pagos
    cy.get('.bancos-back').click()
    cy.wait(1100)
    cy.contains('Estado de cuenta').should('be.visible')
    cy.wait(1000)

    // Descargar estado de cuenta en PDF
    cy.contains('Descargar estado de cuenta en PDF').scrollIntoView()
    cy.wait(900)
    cy.get('.descargar-btn').click()
    cy.wait(1400)
    cy.contains('Estado de cuenta descargado correctamente').should('be.visible')
    cy.wait(1100)

    // Abrir contactos con el botón ?
    cy.scrollTo('top')
    cy.wait(900)
    cy.get('.help-btn').click()
    cy.wait(1100)
    cy.contains('Contactos').should('be.visible')
    cy.wait(1000)

    // Desglosar contactos
    cy.contains('PAGOS Y COLEGIATURAS').scrollIntoView()
    cy.wait(900)
    cy.contains('Consultas de saldos').should('be.visible')
    cy.wait(900)
    cy.contains('Facturación').scrollIntoView()
    cy.wait(900)
    cy.contains('Becas').scrollIntoView()
    cy.wait(1000)

    // Cerrar contactos y regresar a Pagos
    cy.get('.contactos-close').click()
    cy.wait(1100)
    cy.contains('Estado de cuenta').should('be.visible')
    cy.wait(1000)
  })
})
