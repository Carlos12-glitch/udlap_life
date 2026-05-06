describe('Mapa del campus', () => {
  beforeEach(() => {
    cy.visit('/mapa')
    cy.wait(1100)
  })

  it('muestra el título', () => {
    cy.contains('Mapa del campus').should('be.visible')
    cy.wait(1000)
  })

  it('filtra por categoría Deportivo', () => {
    cy.contains('button', 'Deportivo').click()
    cy.wait(1100)
    cy.contains('Templo del Dolor').should('be.visible')
    cy.wait(900)
    cy.contains('Alberca Olímpica').should('be.visible')
    cy.wait(900)
  })

  it('filtra por categoría Académico', () => {
    cy.contains('button', 'Académico').click()
    cy.wait(1100)
    cy.contains('Biblioteca').should('be.visible')
    cy.wait(900)
    cy.contains('Edificio de Negocios').should('be.visible')
    cy.wait(900)
  })

  it('busca un lugar por nombre', () => {
    cy.get('input[placeholder="Buscar un lugar..."]').type('Biblioteca', { delay: 150 })
    cy.wait(1100)
    cy.contains('Biblioteca').should('be.visible')
    cy.wait(900)
    cy.contains('Gimnasio').should('not.exist')
    cy.wait(900)
  })

  it('limpia la búsqueda con el botón ✕', () => {
    cy.get('input[placeholder="Buscar un lugar..."]').type('Biblioteca', { delay: 150 })
    cy.wait(1100)
    cy.contains('button', '✕').click()
    cy.wait(1000)
    cy.get('input[placeholder="Buscar un lugar..."]').should('have.value', '')
    cy.wait(900)
  })

  it('muestra mensaje cuando no hay resultados', () => {
    cy.get('input[placeholder="Buscar un lugar..."]').type('xyzabc', { delay: 150 })
    cy.wait(1100)
    cy.contains('No se encontraron lugares').should('be.visible')
    cy.wait(1000)
  })
})
