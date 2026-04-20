import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Share2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663138388912/Sg53Qp3VHExKb8spk84Ana/WhatsAppImage2026-04-16at08.01.14_20623c9f.jpeg";

export default function LoansPage() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    experimentId: "",
    withdrawalDate: "",
    returnDate: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Fetch data
  const { data: experiments = [], isLoading: experimentsLoading } = trpc.experiments.list.useQuery();
  const { data: logoSizeConfig } = trpc.settings.getLogoSize.useQuery();
  const logoSize = logoSizeConfig?.size || "h-10";
  const createLoan = trpc.loans.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.institution || !formData.experimentId || !formData.withdrawalDate || !formData.returnDate) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    // Validação de datas
    const withdrawalDate = new Date(formData.withdrawalDate);
    const returnDate = new Date(formData.returnDate);

    if (returnDate <= withdrawalDate) {
      toast.error("A data de devolução deve ser posterior à data de retirada");
      return;
    }

    try {
      await createLoan.mutateAsync({
        name: formData.name,
        institution: formData.institution,
        experimentId: parseInt(formData.experimentId),
        withdrawalDate: new Date(formData.withdrawalDate),
        returnDate: new Date(formData.returnDate),
      });

      setSubmitted(true);
      setFormData({
        name: "",
        institution: "",
        experimentId: "",
        withdrawalDate: "",
        returnDate: "",
      });

      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } catch (error) {
      toast.error("Erro ao solicitar empréstimo. Tente novamente.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Header */}
      <header className="border-b-4 border-blue-600 bg-white shadow-md">
        <div className="container flex items-center justify-between py-3" style={{backgroundColor: '#ffffff'}}>
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="LAPEQ-UFOB" className={`${logoSize} w-auto`} style={{width: '500px'}} />
            <h1 className="text-xl font-bold text-green-700"></h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4 text-blue-700 hover:bg-blue-100" 
            style={{width: '63px', height: '46px'}}
          >
            ← Voltar
          </Button>
        </div>
      </header>

      {/* Title Section */}
      <section className="container py-8">
        <h1 className="text-3xl font-bold text-blue-800" style={{paddingLeft: '52px', width: '410px', height: '90px', marginTop: '-388px', marginLeft: '626px'}}>Solicitar Empréstimo de Experimento</h1>
        <p className="mt-2 text-gray-600" style={{width: '459px', height: '53px', paddingLeft: '4px', marginLeft: '675px', marginTop: '-29px'}}>
          Preencha o formulário abaixo para solicitar um kit de experimento
        </p>
      </section>

      {/* Separador */}
      <div className="border-t-4 border-green-600 my-8"></div>

      {/* Form Section */}
      <section className="container py-12">
        <div className="mx-auto max-w-2xl">
          {submitted ? (
            <Card className="border-2 border-green-300 bg-green-50 shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
                  <h2 className="text-2xl font-bold text-green-800 mb-2">
                    Solicitação Enviada com Sucesso!
                  </h2>
                  <p className="text-gray-700 mb-6">
                    Sua solicitação de empréstimo foi recebida. Entraremos em contato em breve para confirmar os detalhes.
                  </p>
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Voltar à Página Inicial
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-2 border-blue-300 bg-white shadow-lg" style={{width: '671px', height: '168px', marginLeft: '504px', marginTop: '87px', backgroundColor: '#ffffff', borderColor: '#ffffff'}}>
              <CardHeader style={{backgroundColor: '#d4eced'}}>
                <div className="mb-4 rounded-lg bg-blue-600 p-3 w-fit">
                  <Share2 className="h-6 w-6 text-white" style={{paddingLeft: '149px'}} />
                </div>
                <CardTitle className="text-blue-800">Formulário de Empréstimo</CardTitle>
                <CardDescription className="text-gray-600">
                  Todos os campos marcados com * são obrigatórios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nome */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Nome Completo *
                    </label>
                    <Input
                      type="text"
                      placeholder="Seu nome"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                      required
                    />
                  </div>

                  {/* Instituição */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Instituição *
                    </label>
                    <Input
                      type="text"
                      placeholder="Nome da sua escola/universidade"
                      value={formData.institution}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                      required
                    />
                  </div>



                  {/* Experimento */}
                  <div style={{backgroundColor: '#ebebeb'}}>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Experimento Solicitado *
                    </label>
                    <Select value={formData.experimentId} onValueChange={(value) => setFormData({ ...formData, experimentId: value })}>
                      <SelectTrigger className="border-2 border-green-200 focus:border-green-600 bg-white" style={{paddingLeft: '0px', marginLeft: '256px', marginTop: '-20px', paddingTop: '0px'}}>
                        <SelectValue placeholder="Selecione um experimento" />
                      </SelectTrigger>
                      <SelectContent>
                        {experimentsLoading ? (
                          <SelectItem value="loading" disabled>Carregando...</SelectItem>
                        ) : (
                          experiments.map((exp) => (
                            <SelectItem key={exp.id} value={exp.id.toString()}>
                              {exp.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Data de Retirada */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Data de Retirada *
                    </label>
                    <Input
                      type="date"
                      value={formData.withdrawalDate}
                      onChange={(e) => setFormData({ ...formData, withdrawalDate: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                      required
                    />
                  </div>

                  {/* Data de Devolução */}
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-2">
                      Data de Devolução *
                    </label>
                    <Input
                      type="date"
                      value={formData.returnDate}
                      onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-600 bg-white"
                      min={formData.withdrawalDate}
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={createLoan.isPending}
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {createLoan.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      "Solicitar Empréstimo"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Separador */}
      <div className="border-t-4 border-blue-600 my-8"></div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container text-center">
          <p className="mb-2" style={{marginTop: '56px'}}>LAPEQ-UFOB - Laboratório de Pesquisas em Ensino de Química</p>
          <p className="text-gray-400" style={{display: 'none'}}>Universidade Federal do Oeste da Bahia</p>
        </div>
      </footer>
    </div>
  );
}
