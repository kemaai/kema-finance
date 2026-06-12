// Fallback landing content. The "/" route is normally handled by the
// authenticated Dashboard; this component only renders when used as a
// standalone fallback.

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-bold mb-4 text-foreground">
          KemaFinance — Gestão Financeira Inteligente
        </h1>
        <p className="text-lg text-muted-foreground">
          CRM e gestão financeira para MEIs e freelancers: clientes, serviços,
          despesas, dívidas e relatórios em um único painel.
        </p>
      </div>
    </div>
  );
};

export default Index;
