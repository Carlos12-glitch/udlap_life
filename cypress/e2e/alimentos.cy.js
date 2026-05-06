describe('Menú del día', () => {
  it('flujo completo: home → menú del día → seleccionar cada día', () => {
    // Desde Home, buscar y entrar a Alimentos
    cy.visit('/home')
    cy.wait(1100)
    cy.get('.search-bar input').type('Alimentos', { delay: 150 })
    cy.wait(1100)
    cy.get('.search-results').should('be.visible')
    cy.wait(900)
    cy.contains('.search-result-item', 'Alimentos').click()
    cy.wait(1100)
    cy.url().should('include', '/alimentos')
    cy.wait(1100)

    // Verificar que cargó la página
    cy.contains('Menú del día').should('be.visible')
    cy.wait(900)
    cy.contains('Comedor Américas').should('be.visible')
    cy.wait(1000)

    // Lunes (activo por defecto)
    cy.contains('.dia-btn', 'Lunes').should('have.class', 'active')
    cy.wait(1000)

    // Martes
    cy.contains('.dia-btn', 'Martes').click()
    cy.wait(1000)
    cy.contains('.dia-btn', 'Martes').should('have.class', 'active')
    cy.wait(1000)

    // Miércoles
    cy.contains('.dia-btn', 'Miércoles').click()
    cy.wait(1000)
    cy.contains('.dia-btn', 'Miércoles').should('have.class', 'active')
    cy.wait(1000)

    // Jueves
    cy.contains('.dia-btn', 'Jueves').click()
    cy.wait(1000)
    cy.contains('.dia-btn', 'Jueves').should('have.class', 'active')
    cy.wait(1000)

    // Viernes
    cy.contains('.dia-btn', 'Viernes').click()
    cy.wait(1000)
    cy.contains('.dia-btn', 'Viernes').should('have.class', 'active')
    cy.wait(1000)

    // Tipos de menú
    cy.contains('Tipos de menú').scrollIntoView()
    cy.wait(1000)
    cy.contains('Menú de línea').should('be.visible')
    cy.wait(900)
    cy.contains('Menú estudiantil').should('be.visible')
    cy.wait(1000)
  })
})
