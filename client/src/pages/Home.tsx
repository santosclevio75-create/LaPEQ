import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Beaker, BookOpen, Share2, Leaf } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useDesignStyles } from "@/hooks/useDesignStyles";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663138388912/Sg53Qp3VHExKb8spk84Ana/WhatsAppImage2026-04-16at08.01.14_20623c9f.jpeg";

export default function Home() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data: categories = [] } = trpc.categories.list.useQuery();
  const { data: logoSizeConfig } = trpc.settings.getLogoSize.useQuery();
  const logoSize = logoSizeConfig?.size || "h-10";
  const designStyles = useDesignStyles("Home");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Header com Logo */}
      <header className="border-b-4 border-green-600 bg-white shadow-md">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} alt="LAPEQ-UFOB" className={`${logoSize} w-auto`} style={{width: '249px'}} />
            <div style={{backgroundColor: '#ffffff', marginLeft: '4px', width: '534px'}}>
              <h1 className="text-xl font-bold text-green-700">Laboratório 112 virtual</h1>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/experiments")}
              className="text-green-700 hover:bg-green-100" 
              style={{width: '180px', backgroundColor: '#b0d5fc', marginLeft: '1px'}}
            >
              Experimentos
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate("/loans")}
              className="text-blue-700 hover:bg-blue-100" 
              style={{width: '180px', backgroundColor: '#adf5a8'}}
            >
              Empréstimos de Kits de experimentos
            </Button>
            {isAuthenticated && user?.role === "admin" && (
              <Button
                variant="default"
                onClick={() => navigate("/admin")}
                className="bg-green-600 text-white hover:bg-green-700" 
                style={{width: '180px', backgroundColor: '#b0d5fc'}}
              >
                Admin
              </Button>
            )}
            {!isAuthenticated && (
              <Button
                variant="default"
                onClick={() => (window.location.href = getLoginUrl())}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Login
              </Button>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-5xl font-bold text-green-800">
            Explorando a Química
          </h2>
          <p className="mb-8 text-lg text-gray-700">
            Explore experimentos educacionais cuidadosamente elaborados para ensinar os princípios fundamentais da química. Solicite kits para suas aulas e transforme o aprendizado em uma experiência prática e memorável.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              onClick={() => navigate("/experiments")}
              className="bg-green-600 text-white hover:bg-green-700" 
              style={{display: 'none'}}
            >
              Explorar Experimentos
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/loans")}
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50" 
              style={{display: 'none'}}
            >
              Solicitar Empréstimo
            </Button>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="border-t-4 border-green-600 my-8"></div>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="container" style={{backgroundColor: '#ffffff'}}>
          <h3 className="mb-12 text-center text-3xl font-bold text-green-800">
            Por que usar o Lab 112 virtual?
          </h3>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
              <CardHeader style={{backgroundColor: '#b0d5fc', width: '152px'}}>
                <div className="mb-4 rounded-lg bg-green-600 p-3 w-fit">
                  <Beaker className="h-6 w-6 text-white" style={{paddingLeft: '58px'}} />
                </div>
                <CardTitle className="text-green-800" style={{width: '152px'}}>Experimentos Práticos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Experimentos cuidadosamente elaborados com instruções passo a passo, explicações científicas e aplicações do cotidiano.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50 hover:shadow-lg transition-shadow">
              <CardHeader style={{backgroundColor: '#adf5a8'}}>
                <div className="mb-4 rounded-lg bg-blue-600 p-3 w-fit">
                  <Share2 className="h-6 w-6 text-white" style={{paddingLeft: '57px'}} />
                </div>
                <CardTitle className="text-blue-800">Sistema de Empréstimo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Solicite kits de experimentos para suas instituições. Gerenciamento simples de datas de retirada e devolução.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50 hover:shadow-lg transition-shadow">
              <CardHeader style={{backgroundColor: '#b0d5fc'}}>
                <div className="mb-4 rounded-lg bg-green-600 p-3 w-fit">
                  <Leaf className="h-6 w-6 text-white" style={{paddingLeft: '17px'}} />
                </div>
                <CardTitle className="text-green-800" style={{width: '152px'}}>Organizado por Temas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Experimentos organizados em categorias: Atmosfera, Água, Solo e Sustentabilidade.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="border-t-4 border-blue-600 my-8"></div>

      {/* Categorias Section */}
      <section className="container py-16" style={{backgroundColor: '#fafafa'}}>
        <h3 className="mb-12 text-center text-3xl font-bold text-blue-800" style={{display: 'none'}}>
          Categorias de Experimentos
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => navigate(`/experiments?category=${category.id}`)}
              className="group relative overflow-hidden rounded-lg border-2 border-green-300 bg-gradient-to-br from-green-50 to-blue-50 p-8 text-center transition-all hover:border-green-600 hover:shadow-lg hover:scale-105"
              style={{width: '266px', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', display: 'none', height: '109px', height: '90px', height: '85px', width: '232px', width: '338px', height: '84px', width: '290px', width: '238px', width: '271px', width: '304px', height: '98px', height: '99px', width: '266px', height: '98px'}}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/0 to-blue-600/0 group-hover:from-green-600/10 group-hover:to-blue-600/10 transition-all"></div>
              <div className="relative">
                <h4 className="text-xl font-bold text-green-800 mb-2">{category.name}</h4>
                <p className="text-sm text-gray-600">{category.description || "Clique para explorar"}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Separador */}
      <div className="border-t-4 border-green-600 my-8"></div>

      {/* Empréstimos Section */}
      <section className="bg-blue-50 py-16">
        <div className="container" style={{backgroundColor: '#ffffff'}}>
          <h3 className="mb-8 text-center text-3xl font-bold text-blue-800">
            Solicitar Empréstimos
          </h3>
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-2 border-blue-300 bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4 rounded-lg bg-blue-600 p-3 w-fit" style={{backgroundColor: '#b0d5fc'}}>
                  <Beaker className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-blue-800" style={{backgroundColor: '#b0d5fc'}}>Empréstimo de Experimentos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Solicite kits de experimentos para suas aulas. Escolha a data de retirada e devolução.
                </p>
                <Button
                  onClick={() => navigate("/loans")}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                >
                  Solicitar Experimento
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-300 bg-white hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4 rounded-lg bg-green-600 p-3 w-fit" style={{backgroundColor: '#adf5a8', width: '190px'}}>
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-green-800" style={{backgroundColor: '#adf5a8'}}>Empréstimo de Livros</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">
                  Solicite livros e materiais de referência sobre química e educação científica.
                </p>
                <Button
                  onClick={() => navigate("/book-loans")}
                  className="w-full bg-green-600 text-white hover:bg-green-700"
                >
                  Solicitar Livro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Separador */}
      <div className="border-t-4 border-blue-600 my-8"></div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container text-center">
          <p className="mb-2">LAPEQ-UFOB - Laboratório de Pesquisas em Ensino de Química</p>
          <p className="text-gray-400">Universidade Federal do Oeste da Bahia</p>
        </div>
      </footer>
    </div>
  );
}
