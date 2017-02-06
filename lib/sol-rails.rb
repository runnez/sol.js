module Sol
  def self.install(sprockets)
    sprockets.paths << Pathname(__FILE__).dirname
  end

  if defined? ::Rails
    class Engine < ::Rails::Engine
      initializer 'sol' do |app|
        Sol.install(app.config.assets)
      end
    end
  end
end
