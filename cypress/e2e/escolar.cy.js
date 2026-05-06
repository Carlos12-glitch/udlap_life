describe('Escolar', () => {
  it('flujo completo: home → escolar → horario → calificaciones → transcript', () => {
    // Desde Home, buscar y entrar a Escolar
    cy.visit('/home')
    cy.wait(1100)
    cy.get('.search-bar input').type('Escolar', { delay: 150 })
    cy.wait(1100)
    cy.get('.search-results').should('be.visible')
    cy.wait(900)
    cy.contains('.search-result-item', 'Escolar').click()
    cy.wait(1100)
    cy.url().should('include', '/escolar')
    cy.wait(1100)

    // Centro académico
    cy.contains('Centro académico').should('be.visible')
    cy.wait(1000)
    cy.contains('Horario').should('be.visible')
    cy.wait(900)
    cy.contains('Calificaciones').should('be.visible')
    cy.wait(900)
    cy.contains('Transcript').should('be.visible')
    cy.wait(1000)

    // Tutor académico
    cy.contains('Tutor académico').scrollIntoView()
    cy.wait(1100)
    cy.contains('Dr. Carlos Mendoza Ramírez').should('be.visible')
    cy.wait(1000)

    // Progreso de carrera
    cy.contains('Progreso de carrera').scrollIntoView()
    cy.wait(1100)
    cy.get('.progress-card').should('be.visible')
    cy.wait(1000)

    // Orientación académica
    cy.contains('Orientación académica').scrollIntoView()
    cy.wait(1100)
    cy.contains('orientacion.academica@udlap.mx').should('be.visible')
    cy.wait(1000)

    // Volver arriba y entrar a Horario
    cy.scrollTo('top')
    cy.wait(900)
    cy.contains('.academic-card', 'Horario').click()
    cy.wait(1100)
    cy.url().should('include', '/horario')
    cy.wait(1400)

    // Navegar por días
    cy.contains('.dia-btn', 'Martes').click()
    cy.wait(1000)
    cy.contains('.dia-btn', 'Martes').should('have.class', 'active')
    cy.wait(1000)
    cy.contains('.dia-btn', 'Miércoles').click()
    cy.wait(1000)
    cy.contains('.dia-btn', 'Miércoles').should('have.class', 'active')
    cy.wait(1000)
    cy.contains('.dia-btn', 'Jueves').click()
    cy.wait(1000)
    cy.contains('.dia-btn', 'Jueves').should('have.class', 'active')
    cy.wait(1000)
    cy.contains('.dia-btn', 'Viernes').click()
    cy.wait(1000)
    cy.contains('.dia-btn', 'Viernes').should('have.class', 'active')
    cy.wait(1000)

    // Cambiar a vista calendario
    cy.get('.vista-btn[title="Vista calendario"]').click()
    cy.wait(1100)
    cy.get('.vista-btn[title="Vista calendario"]').should('have.class', 'active')
    cy.wait(1000)

    // Exportar horario
    cy.get('.btn-exportar').click()
    cy.wait(1100)

    // Regresar a Escolar y entrar a Calificaciones
    cy.go('back')
    cy.url({ timeout: 6000 }).should('include', '/escolar')
    cy.wait(1000)
    cy.contains('.academic-card', 'Calificaciones').click()
    cy.wait(1100)
    cy.url().should('include', '/calificaciones')
    cy.wait(1400)

    // Primavera 2026 — expandir cada materia
    cy.contains('.periodo-tab', 'Primavera 2026').should('have.class', 'active')
    cy.wait(900)
    cy.get('.materia-card').each(($card, i) => {
      cy.wrap($card).scrollIntoView()
      cy.wait(1400)
      cy.wrap($card).click()
      cy.wait(900)
    })

    // Cambiar a Otoño 2025
    cy.contains('.periodo-tab', 'Otoño 2025').click()
    cy.wait(1100)
    cy.contains('.periodo-tab', 'Otoño 2025').should('have.class', 'active')
    cy.wait(1000)

    // Cambiar a Primavera 2025
    cy.contains('.periodo-tab', 'Primavera 2025').click()
    cy.wait(1100)
    cy.contains('.periodo-tab', 'Primavera 2025').should('have.class', 'active')
    cy.wait(1000)

    // Regresar a Escolar y entrar a Transcript
    cy.go('back')
    cy.url({ timeout: 6000 }).should('include', '/escolar')
    cy.wait(1000)
    cy.contains('.academic-card', 'Transcript').click()
    cy.wait(1100)
    cy.url().should('include', '/transcript')
    cy.wait(1400)

    // Expandir Ingeniería en Sistemas Computacionales
    cy.contains('button', 'Ingeniería en Sistemas Computacionales').scrollIntoView()
    cy.wait(900)
    cy.contains('button', 'Ingeniería en Sistemas Computacionales').click()
    cy.wait(1100)
    cy.contains('Periodo de ingreso').should('be.visible')
    cy.wait(1000)

    // Expandir Administración de Empresas
    cy.contains('button', 'Administración de Empresas').scrollIntoView()
    cy.wait(900)
    cy.contains('button', 'Administración de Empresas').click()
    cy.wait(1100)
    cy.contains('Estatus del alumno').should('be.visible')
    cy.wait(1000)

    // Historial — expandir cada periodo individualmente
    cy.contains('.periodo-toggle', 'Primavera 2025').scrollIntoView()
    cy.wait(900)
    cy.contains('.periodo-toggle', 'Primavera 2025').click()
    cy.wait(1000)

    cy.contains('.periodo-toggle', 'Otoño 2025').scrollIntoView()
    cy.wait(900)
    cy.contains('.periodo-toggle', 'Otoño 2025').click()
    cy.wait(1000)

    cy.contains('.periodo-toggle', 'Primavera 2026').scrollIntoView()
    cy.wait(900)
    cy.contains('.periodo-toggle', 'Primavera 2026').click()
    cy.wait(1000)
  })
})
