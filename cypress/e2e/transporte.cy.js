describe('Transporte', () => {
  beforeEach(() => {
    cy.visit('/transporte')
    cy.wait(1100)
  })

  it('muestra el encabezado de Transporte', () => {
    cy.contains('Transporte UDLAP').should('be.visible')
    cy.wait(1000)
  })

  it('muestra las rutas universitarias', () => {
    cy.contains('Rutas universitarias').should('be.visible')
    cy.wait(1000)
  })

  it('abre el acordeón de Rutas universitarias', () => {
    cy.contains('Rutas universitarias').click()
    cy.wait(1100)
    cy.contains('Ruta Puebla').should('be.visible')
    cy.wait(900)
  })

  it('abre el acordeón de Puntos de venta y muestra los lugares', () => {
    cy.contains('Puntos de venta').click()
    cy.wait(1100)
    cy.contains('Tienda universitaria').should('be.visible')
    cy.wait(900)
    cy.contains('Dominicana').should('be.visible')
    cy.wait(900)
    cy.contains('Círculo K').should('be.visible')
    cy.wait(1000)
    cy.contains('Puntos de venta').click()
    cy.wait(1000)
    cy.contains('Tienda universitaria').should('not.exist')
    cy.wait(900)
  })

  it('abre los horarios al presionar Ver horarios', () => {
    cy.contains('Rutas universitarias').click()
    cy.wait(1100)
    cy.contains('Ruta Puebla').parents('[class*="ruta-nueva-card"]').within(() => {
      cy.contains('Ver horarios').click()
    })
    cy.wait(700)
    cy.get('.horario-overlay').should('be.visible')
    cy.wait(900)
    cy.contains('RUTA PUEBLA').should('be.visible')
    cy.wait(1000)
    cy.get('.horario-ov-close').click()
    cy.wait(1000)
    cy.get('.horario-overlay').should('not.exist')
    cy.wait(900)
  })

  it('abre el mapa de ruta al presionar Ver ruta', () => {
    cy.contains('Rutas universitarias').click()
    cy.wait(1100)
    cy.contains('Ruta Puebla').parents('[class*="ruta-nueva-card"]').within(() => {
      cy.contains('Ver ruta').click()
    })
    cy.wait(700)
    cy.get('.ruta-mapa-overlay').should('be.visible')
    cy.wait(1000)
  })

  it('cierra el mapa de ruta', () => {
    cy.contains('Rutas universitarias').click()
    cy.wait(1100)
    cy.contains('Ruta Puebla').parents('[class*="ruta-nueva-card"]').within(() => {
      cy.contains('Ver ruta').click()
    })
    cy.wait(700)
    cy.get('.ruta-mapa-overlay').should('be.visible')
    cy.wait(1000)
    cy.get('.ruta-mapa-overlay button').first().click()
    cy.wait(1000)
    cy.get('.ruta-mapa-overlay').should('not.exist')
    cy.wait(900)
  })
})
